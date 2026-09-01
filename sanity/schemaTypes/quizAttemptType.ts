import { CheckmarkCircleIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const quizAttemptType = defineType({
  name: "quizAttempt",
  title: "Quiz Attempt",
  type: "document",
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: "quiz",
      type: "reference",
      to: [{ type: "quiz" }],
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "student",
      type: "string",
      description: "Clerk user ID of the student who took the quiz",
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "answers",
      type: "array",
      description: "Graded answers, one per question, keyed to the question's _key on the quiz",
      of: [
        defineArrayMember({
          type: "object",
          name: "gradedAnswer",
          fields: [
            defineField({ name: "questionKey", type: "string" }),
            defineField({ name: "isCorrect", type: "boolean" }),
            defineField({ name: "pointsAwarded", type: "number" }),
            defineField({
              name: "submittedValue",
              type: "text",
              description: "JSON-stringified submitted answer, for review/audit",
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "scorePercent",
      type: "number",
      validation: (Rule) => [Rule.required().min(0).max(100)],
    }),
    defineField({
      name: "passed",
      type: "boolean",
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "totalPointsAwarded",
      type: "number",
      validation: (Rule) => [Rule.required().min(0)],
    }),
    defineField({
      name: "completedAt",
      type: "datetime",
      validation: (Rule) => [Rule.required()],
    }),
  ],
  preview: {
    select: {
      quizTitle: "quiz.title",
      student: "student",
      scorePercent: "scorePercent",
      passed: "passed",
    },
    prepare({ quizTitle, student, scorePercent, passed }) {
      return {
        title: quizTitle || "Untitled Quiz",
        subtitle: `${student} • ${scorePercent}% • ${passed ? "Passed" : "Failed"}`,
        media: CheckmarkCircleIcon,
      };
    },
  },
  orderings: [
    {
      title: "Most Recent",
      name: "completedAtDesc",
      by: [{ field: "completedAt", direction: "desc" }],
    },
  ],
});
