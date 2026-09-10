import { StarFilledIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const pointsTransactionType = defineType({
  name: "pointsTransaction",
  title: "Points Transaction",
  type: "document",
  icon: StarFilledIcon,
  fields: [
    defineField({
      name: "student",
      type: "string",
      description: "Clerk user ID of the student this transaction belongs to",
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "amount",
      type: "number",
      description: "Positive for earned points, negative for spent points",
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "type",
      type: "string",
      options: {
        list: [
          { title: "Quiz Earned", value: "quiz_earn" },
          { title: "Redemption Spend", value: "redemption_spend" },
        ],
      },
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "relatedQuizAttempt",
      type: "reference",
      to: [{ type: "quizAttempt" }],
      description: "Set when type is quiz_earn",
    }),
    defineField({
      name: "note",
      type: "string",
      description: "Optional human-readable description shown to the student",
    }),
  ],
  preview: {
    select: {
      student: "student",
      amount: "amount",
      type: "type",
    },
    prepare({ student, amount, type }) {
      const sign = amount > 0 ? "+" : "";
      return {
        title: `${sign}${amount} pts — ${student}`,
        subtitle: type,
        media: StarFilledIcon,
      };
    },
  },
  orderings: [
    {
      title: "Most Recent",
      name: "createdAtDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
