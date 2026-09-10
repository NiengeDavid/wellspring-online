"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getQuizForTaking, submitQuizAttempt } from "@/lib/actions";
import type {
  GradedQuestion,
  SafeQuestion,
  SubmittedAnswer,
} from "@/lib/quiz-types";
import { FillInQuestion } from "./FillInQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { OrderingQuestion } from "./OrderingQuestion";
import { QuestionCard } from "./QuestionCard";
import { QuizResults } from "./QuizResults";
import { SelectAllQuestion } from "./SelectAllQuestion";

interface QuizData {
  id: string;
  title: string;
  passingScorePercent: number;
  questions: SafeQuestion[];
  backHref: string;
  backLabel: string;
}

interface SubmissionResult {
  scorePercent: number;
  passed: boolean;
  pointsAwarded: number;
  pointsWithheldReason: "already_earned" | null;
  questions: GradedQuestion[];
}

interface QuizPlayerProps {
  quizId: string;
}

function buildAnswer(
  question: SafeQuestion,
  raw: unknown,
): SubmittedAnswer | undefined {
  switch (question.type) {
    case "multipleChoiceQuestion":
      if (raw === undefined) return undefined;
      return {
        questionKey: question.key,
        type: "multipleChoiceQuestion",
        selectedOptionKey: raw as string,
      };
    case "selectAllQuestion":
      if (raw === undefined) return undefined;
      return {
        questionKey: question.key,
        type: "selectAllQuestion",
        selectedOptionKeys: raw as string[],
      };
    case "fillInQuestion":
      if (raw === undefined) return undefined;
      return {
        questionKey: question.key,
        type: "fillInQuestion",
        text: raw as string,
      };
    case "orderingQuestion":
      // If the student never dragged anything, submit the order they were
      // shown (already shuffled server-side) rather than treating it as unanswered.
      return {
        questionKey: question.key,
        type: "orderingQuestion",
        orderedItemKeys:
          (raw as string[] | undefined) ?? question.items.map((i) => i.key),
      };
    case "matchingQuestion":
      if (raw === undefined) return undefined;
      return {
        questionKey: question.key,
        type: "matchingQuestion",
        pairs: raw as { leftKey: string; chosenRightKey: string }[],
      };
    default:
      return undefined;
  }
}

export function QuizPlayer({ quizId }: QuizPlayerProps) {
  // Quiz content and "has this student already answered it" are always
  // fetched live, on mount, directly from the server action — the same
  // reliable path Retake already used. This deliberately bypasses every
  // page/route caching layer instead of trying to outsmart it: a fresh
  // quizAttempt (or its absence) is the single source of truth per student.
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadQuiz = () => {
    setError(null);
    startTransition(async () => {
      const response = await getQuizForTaking(quizId);
      if (!response.success) {
        setError(response.error);
        return;
      }
      setQuiz(response.quiz);
      setAnswers({});
      setCurrentIndex(0);
      setResult(response.latestAttempt);
    });
  };

  useEffect(loadQuiz, []);

  if (!quiz) {
    return (
      <div className="flex items-center justify-center py-24">
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        )}
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const isLastQuestion = currentIndex === quiz.questions.length - 1;

  const setAnswer = (value: unknown) => {
    setAnswers((prev) => ({ ...prev, [question.key]: value }));
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const submitted = quiz.questions
        .map((q) => buildAnswer(q, answers[q.key]))
        .filter((a): a is SubmittedAnswer => a !== undefined);

      const response = await submitQuizAttempt(quiz.id, submitted);
      if (!response.success) {
        setError(response.error);
        return;
      }
      setResult(response);
    });
  };

  if (result) {
    return (
      <QuizResults
        scorePercent={result.scorePercent}
        passed={result.passed}
        pointsAwarded={result.pointsAwarded}
        pointsWithheldReason={result.pointsWithheldReason}
        questions={result.questions}
        onRetake={loadQuiz}
        backHref={quiz.backHref}
        backLabel={quiz.backLabel}
      />
    );
  }

  const progressPercent = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-zinc-100">{quiz.title}</h1>
          <span className="text-xs text-zinc-500">
            {currentIndex + 1} / {quiz.questions.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      <QuestionCard
        index={currentIndex}
        total={quiz.questions.length}
        prompt={question.prompt}
        points={question.points}
      >
        {question.type === "multipleChoiceQuestion" && (
          <MultipleChoiceQuestion
            question={question}
            value={answers[question.key] as string | undefined}
            onChange={setAnswer}
          />
        )}
        {question.type === "selectAllQuestion" && (
          <SelectAllQuestion
            question={question}
            value={answers[question.key] as string[] | undefined}
            onChange={setAnswer}
          />
        )}
        {question.type === "fillInQuestion" && (
          <FillInQuestion
            question={question}
            value={answers[question.key] as string | undefined}
            onChange={setAnswer}
          />
        )}
        {question.type === "orderingQuestion" && (
          <OrderingQuestion
            question={question}
            value={answers[question.key] as string[] | undefined}
            onChange={setAnswer}
          />
        )}
        {question.type === "matchingQuestion" && (
          <MatchingQuestion
            question={question}
            value={
              answers[question.key] as
                | { leftKey: string; chosenRightKey: string }[]
                | undefined
            }
            onChange={setAnswer}
          />
        )}
      </QuestionCard>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          disabled={currentIndex === 0 || isPending}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() =>
              setCurrentIndex((i) => Math.min(quiz.questions.length - 1, i + 1))
            }
            disabled={isPending}
            className="bg-violet-600 hover:bg-violet-500 text-white"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
