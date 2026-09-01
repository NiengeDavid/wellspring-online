import { EditIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const fillInQuestionType = defineType({
  name: "fillInQuestion",
  title: "Fill in the Blank",
  type: "object",
  icon: EditIcon,
  fields: [
    defineField({
      name: "prompt",
      type: "text",
      description: 'Use "___" to mark where the blank goes, e.g. "useState returns an array of ___ and ___."',
      validation: (Rule) => [Rule.required().error("Question prompt is required")],
    }),
    defineField({
      name: "points",
      type: "number",
      initialValue: 10,
      validation: (Rule) => [Rule.required().min(1).error("Points must be at least 1")],
    }),
    defineField({
      name: "acceptableAnswers",
      type: "array",
      description:
        "All answers that should be accepted (matching is case-insensitive and ignores extra whitespace). Include common synonyms or phrasing variants.",
      of: [defineArrayMember({ type: "string" })],
      validation: (Rule) => [
        Rule.required().min(1).error("Add at least one acceptable answer"),
      ],
    }),
  ],
  preview: {
    select: { title: "prompt" },
    prepare({ title }) {
      return {
        title: title || "Untitled question",
        subtitle: "Fill in the Blank",
      };
    },
  },
});
