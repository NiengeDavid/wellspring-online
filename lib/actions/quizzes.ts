"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { Tier } from "@/lib/constants";
import { hasAccessToTier } from "@/lib/course-access";
import type {
  GradedQuestion,
  SafeQuestion,
  SubmittedAnswer,
} from "@/lib/quiz-types";
import { writeClient } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  POINTS_TRANSACTIONS_FOR_STUDENT_QUERY,
  QUIZ_ATTEMPTS_FOR_STUDENT_QUERY,
  QUIZ_FULL_BY_ID_QUERY,
  QUIZ_LATEST_ATTEMPT_QUERY,
} from "@/sanity/lib/queries";
import type { QUIZ_FULL_BY_ID_QUERYResult } from "@/sanity.types";

type FullQuiz = NonNullable<QUIZ_FULL_BY_ID_QUERYResult>;
type FullQuestion = NonNullable<FullQuiz["questions"]>[number];

// A lesson-quiz is locked until its own lesson is complete. A module-quiz is
// locked until the last item in that module (last lesson, or that lesson's
// quiz if it has one) is complete. Course-level quizzes (final exams) are
// never locked.
function isQuizLocked(quiz: FullQuiz, userId: string): boolean {
  if (quiz.lesson) {
    return !(quiz.lesson.completedBy ?? []).includes(userId);
  }
  if (quiz.module) {
    const lessons = quiz.module.lessons ?? [];
    const lastLesson = lessons[lessons.length - 1];
    if (!lastLesson) return false;
    if (lastLesson.quiz) {
      return !(lastLesson.quiz.completedBy ?? []).includes(userId);
    }
    return !(lastLesson.completedBy ?? []).includes(userId);
  }
  return false;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sanitizeQuestion(question: FullQuestion): SafeQuestion | null {
  const base = {
    key: question._key,
    prompt: question.prompt ?? "",
    points: question.points ?? 0,
  };

  switch (question._type) {
    case "multipleChoiceQuestion":
    case "selectAllQuestion":
      return {
        ...base,
        type: question._type,
        options: shuffle(
          (question.options ?? []).map((o) => ({
            key: o._key,
            text: o.text ?? "",
          })),
        ),
      };
    case "fillInQuestion":
      return { ...base, type: "fillInQuestion" };
    case "orderingQuestion":
      return {
        ...base,
        type: "orderingQuestion",
        items: shuffle(
          (question.items ?? []).map((i) => ({
            key: i._key,
            text: i.text ?? "",
          })),
        ),
      };
    case "matchingQuestion": {
      const pairs = question.pairs ?? [];
      return {
        ...base,
        type: "matchingQuestion",
        leftItems: pairs.map((p) => ({ key: p._key, text: p.left ?? "" })),
        rightItems: shuffle(
          pairs.map((p) => ({ key: p._key, text: p.right ?? "" })),
        ),
      };
    }
    default:
      return null;
  }
}

export async function getQuizForTaking(quizId: string): Promise<
  | {
      success: true;
      quiz: {
        id: string;
        title: string;
        passingScorePercent: number;
        questions: SafeQuestion[];
        backHref: string;
        backLabel: string;
      };
      latestAttempt: {
        scorePercent: number;
        passed: boolean;
        pointsAwarded: number;
        pointsWithheldReason: "already_earned" | null;
        questions: GradedQuestion[];
      } | null;
    }
  | {
      success: false;
      error: string;
      requiredTier?: Tier;
      locked?: boolean;
      backHref?: string;
      backLabel?: string;
    }
> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in to take a quiz." };
  }

  const { data: quiz } = await sanityFetch({
    query: QUIZ_FULL_BY_ID_QUERY,
    params: { id: quizId },
  });

  if (!quiz) {
    return { success: false, error: "Quiz not found." };
  }

  const backHref = quiz.lesson?.slug
    ? `/lessons/${quiz.lesson.slug}`
    : quiz.course?.slug
      ? `/courses/${quiz.course.slug}`
      : "/dashboard";
  const backLabel = quiz.lesson?.slug
    ? "Back to Lesson"
    : quiz.course?.slug
      ? "Back to Course"
      : "Back to Dashboard";

  const requiredTier = (quiz.tier as Tier | null | undefined) ?? "free";
  const allowed = await hasAccessToTier(requiredTier);
  if (!allowed) {
    return {
      success: false,
      error: "Your plan doesn't include access to this quiz.",
      requiredTier,
    };
  }

  if (isQuizLocked(quiz, userId)) {
    return {
      success: false,
      error: "Complete the previous lesson or quiz to unlock this one.",
      locked: true,
      backHref,
      backLabel,
    };
  }

  const questions = (quiz.questions ?? [])
    .map(sanitizeQuestion)
    .filter((q): q is SafeQuestion => q !== null);

  const { data: latest } = await sanityFetch({
    query: QUIZ_LATEST_ATTEMPT_QUERY,
    params: { quizId, studentId: userId },
  });

  const maxPointsByKey = new Map(
    (quiz.questions ?? []).map((q) => [q._key, q.points ?? 0]),
  );

  const latestAttempt = latest
    ? {
        scorePercent: latest.scorePercent ?? 0,
        passed: latest.passed ?? false,
        pointsAwarded: latest.totalPointsAwarded ?? 0,
        pointsWithheldReason: null,
        questions: (latest.answers ?? []).map((a) => ({
          questionKey: a.questionKey ?? "",
          isCorrect: a.isCorrect ?? false,
          pointsAwarded: a.pointsAwarded ?? 0,
          maxPoints: maxPointsByKey.get(a.questionKey ?? "") ?? 0,
        })),
      }
    : null;

  return {
    success: true,
    quiz: {
      id: quiz._id,
      title: quiz.title ?? "Untitled Quiz",
      passingScorePercent: quiz.passingScorePercent ?? 70,
      questions,
      backHref,
      backLabel,
    },
    latestAttempt,
  };
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function gradeQuestion(
  question: FullQuestion,
  submitted: SubmittedAnswer | undefined,
): GradedQuestion {
  const maxPoints = question.points ?? 0;
  const fail: GradedQuestion = {
    questionKey: question._key,
    isCorrect: false,
    pointsAwarded: 0,
    maxPoints,
  };

  if (!submitted) return fail;

  switch (question._type) {
    case "multipleChoiceQuestion": {
      if (submitted.type !== "multipleChoiceQuestion") return fail;
      const correctKey = (question.options ?? []).find(
        (o) => o.isCorrect,
      )?._key;
      const isCorrect =
        !!correctKey && submitted.selectedOptionKey === correctKey;
      return {
        questionKey: question._key,
        isCorrect,
        pointsAwarded: isCorrect ? maxPoints : 0,
        maxPoints,
      };
    }
    case "selectAllQuestion": {
      if (submitted.type !== "selectAllQuestion") return fail;
      const correctKeys = new Set(
        (question.options ?? []).filter((o) => o.isCorrect).map((o) => o._key),
      );
      const submittedKeys = new Set(submitted.selectedOptionKeys);
      const isCorrect =
        correctKeys.size === submittedKeys.size &&
        [...correctKeys].every((k) => submittedKeys.has(k));
      return {
        questionKey: question._key,
        isCorrect,
        pointsAwarded: isCorrect ? maxPoints : 0,
        maxPoints,
      };
    }
    case "fillInQuestion": {
      if (submitted.type !== "fillInQuestion") return fail;
      const acceptable = (question.acceptableAnswers ?? []).map(normalizeText);
      const isCorrect = acceptable.includes(
        normalizeText(submitted.text ?? ""),
      );
      return {
        questionKey: question._key,
        isCorrect,
        pointsAwarded: isCorrect ? maxPoints : 0,
        maxPoints,
      };
    }
    case "orderingQuestion": {
      if (submitted.type !== "orderingQuestion") return fail;
      const correctOrder = (question.items ?? []).map((i) => i._key);
      const submittedOrder = submitted.orderedItemKeys;
      const isCorrect =
        correctOrder.length === submittedOrder.length &&
        correctOrder.every((key, idx) => key === submittedOrder[idx]);
      return {
        questionKey: question._key,
        isCorrect,
        pointsAwarded: isCorrect ? maxPoints : 0,
        maxPoints,
      };
    }
    case "matchingQuestion": {
      if (submitted.type !== "matchingQuestion") return fail;
      const pairKeys = (question.pairs ?? []).map((p) => p._key);
      const submittedMap = new Map(
        submitted.pairs.map((p) => [p.leftKey, p.chosenRightKey]),
      );
      const isCorrect =
        pairKeys.length === submitted.pairs.length &&
        pairKeys.every((key) => submittedMap.get(key) === key);
      return {
        questionKey: question._key,
        isCorrect,
        pointsAwarded: isCorrect ? maxPoints : 0,
        maxPoints,
      };
    }
    default:
      return fail;
  }
}

export async function submitQuizAttempt(
  quizId: string,
  answers: SubmittedAnswer[],
): Promise<
  | {
      success: true;
      scorePercent: number;
      passed: boolean;
      pointsAwarded: number;
      pointsWithheldReason: "already_earned" | null;
      questions: GradedQuestion[];
    }
  | { success: false; error: string }
> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "You must be signed in to submit a quiz." };
  }

  const { data: quiz } = await sanityFetch({
    query: QUIZ_FULL_BY_ID_QUERY,
    params: { id: quizId },
  });

  if (!quiz) {
    return { success: false, error: "Quiz not found." };
  }

  const allowed = await hasAccessToTier(quiz.tier as Tier | null | undefined);
  if (!allowed) {
    return {
      success: false,
      error: "Your plan doesn't include access to this quiz.",
    };
  }

  if (isQuizLocked(quiz, userId)) {
    return {
      success: false,
      error: "Complete the previous lesson or quiz to unlock this one.",
    };
  }

  const questions = quiz.questions ?? [];
  const answersByKey = new Map(answers.map((a) => [a.questionKey, a]));
  const graded = questions.map((q) =>
    gradeQuestion(q, answersByKey.get(q._key)),
  );

  const totalPoints = graded.reduce((sum, g) => sum + g.maxPoints, 0);
  const earnedPoints = graded.reduce((sum, g) => sum + g.pointsAwarded, 0);
  const scorePercent =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercent >= (quiz.passingScorePercent ?? 70);

  // Points can only be earned once per quiz per student, to prevent farming via
  // repeated retakes. Retakes are still recorded so progress/improvement is visible.
  const priorAttemptCount = await writeClient.fetch<number>(
    `count(*[_type == "quizAttempt" && quiz._ref == $quizId && student == $studentId])`,
    { quizId, studentId: userId },
  );
  const isFirstAttempt = priorAttemptCount === 0;
  const pointsAwarded = isFirstAttempt ? earnedPoints : 0;

  const attemptId = `quizAttempt.${userId}.${quizId}.${Date.now()}`;

  const transaction = writeClient.transaction().createOrReplace({
    _id: attemptId,
    _type: "quizAttempt",
    quiz: { _type: "reference", _ref: quizId },
    student: userId,
    answers: graded.map((g) => ({
      _key: g.questionKey,
      questionKey: g.questionKey,
      isCorrect: g.isCorrect,
      pointsAwarded: g.pointsAwarded,
      submittedValue: JSON.stringify(answersByKey.get(g.questionKey) ?? null),
    })),
    scorePercent,
    passed,
    totalPointsAwarded: pointsAwarded,
    completedAt: new Date().toISOString(),
  });

  if (pointsAwarded > 0) {
    transaction.create({
      _type: "pointsTransaction",
      student: userId,
      amount: pointsAwarded,
      type: "quiz_earn",
      relatedQuizAttempt: { _type: "reference", _ref: attemptId },
      note: `Earned from quiz: ${quiz.title}`,
    });
  }

  if (passed && !(quiz.completedBy ?? []).includes(userId)) {
    transaction.patch(quizId, (p) =>
      p.setIfMissing({ completedBy: [] }).append("completedBy", [userId]),
    );
  }

  await transaction.commit();

  if (quiz.lesson?.slug) revalidatePath(`/lessons/${quiz.lesson.slug}`);
  if (quiz.course?.slug) revalidatePath(`/courses/${quiz.course.slug}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    scorePercent,
    passed,
    pointsAwarded,
    pointsWithheldReason: !isFirstAttempt ? "already_earned" : null,
    questions: graded,
  };
}

export async function getStudentQuizActivity(studentId: string) {
  const [{ data: attempts }, { data: transactions }] = await Promise.all([
    sanityFetch({
      query: QUIZ_ATTEMPTS_FOR_STUDENT_QUERY,
      params: { studentId },
    }),
    sanityFetch({
      query: POINTS_TRANSACTIONS_FOR_STUDENT_QUERY,
      params: { studentId },
    }),
  ]);

  const pointsBalance = (transactions ?? []).reduce(
    (sum, t) => sum + (t.amount ?? 0),
    0,
  );

  return {
    attempts: attempts ?? [],
    transactions: transactions ?? [],
    pointsBalance,
  };
}
