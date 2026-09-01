import { ArrowRightIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const matchingQuestionType = defineType({
  name: "matchingQuestion",
  title: "Matching",
  type: "object",
  icon: ArrowRightIcon,
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
      name: "pairs",
      type: "array",
      description: "Each row is a correct pair, e.g. left: \"useState\" right: \"manages local state\".",
      of: [
        defineArrayMember({
          type: "object",
          name: "pair",
          fields: [
            defineField({
              name: "left",
              type: "string",
              validation: (Rule) => [Rule.required().error("Left side is required")],
            }),
            defineField({
              name: "right",
              type: "string",
              validation: (Rule) => [Rule.required().error("Right side is required")],
            }),
          ],
          preview: {
            select: { left: "left", right: "right" },
            prepare({ left, right }) {
              return { title: `${left || "?"} → ${right || "?"}` };
            },
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required().min(3).error("Add at least three pairs"),
        Rule.max(8).warning("Keep to 8 or fewer pairs for a manageable board"),
      ],
    }),
  ],
  preview: {
    select: { title: "prompt" },
    prepare({ title }) {
      return {
        title: title || "Untitled question",
        subtitle: "Matching",
      };
    },
  },
});
