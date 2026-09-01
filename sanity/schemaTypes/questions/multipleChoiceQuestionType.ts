import { CheckmarkCircleIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const multipleChoiceQuestionType = defineType({
  name: "multipleChoiceQuestion",
  title: "Multiple Choice",
  type: "object",
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: "prompt",
      type: "text",
      validation: (Rule) => [Rule.required().error("Question prompt is required")],
    }),
    defineField({
      name: "points",
      type: "number",
      initialValue: 10,
      validation: (Rule) => [Rule.required().min(1).error("Points must be at least 1")],
    }),
    defineField({
      name: "options",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "option",
          fields: [
            defineField({
              name: "text",
              type: "string",
              validation: (Rule) => [Rule.required().error("Option text is required")],
            }),
            defineField({
              name: "isCorrect",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "text", isCorrect: "isCorrect" },
            prepare({ title, isCorrect }) {
              return { title: `${isCorrect ? "✅ " : ""}${title || "Untitled option"}` };
            },
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required().min(2).error("Add at least two options"),
        Rule.max(6).warning("Keep options to 6 or fewer for readability"),
        Rule.custom((options) => {
          const list = (options as { isCorrect?: boolean }[]) || [];
          const correctCount = list.filter((o) => o.isCorrect).length;
          if (correctCount !== 1) {
            return "Exactly one option must be marked correct";
          }
          return true;
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "prompt" },
    prepare({ title }) {
      return {
        title: title || "Untitled question",
        subtitle: "Multiple Choice",
      };
    },
  },
});
