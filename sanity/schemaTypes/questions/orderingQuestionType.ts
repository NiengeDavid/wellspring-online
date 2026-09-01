import { SortIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderingQuestionType = defineType({
  name: "orderingQuestion",
  title: "Put in Order",
  type: "object",
  icon: SortIcon,
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
      name: "items",
      type: "array",
      description:
        "List the items in the CORRECT order. Students will see them shuffled and drag them into place.",
      of: [
        defineArrayMember({
          type: "object",
          name: "item",
          fields: [
            defineField({
              name: "text",
              type: "string",
              validation: (Rule) => [Rule.required().error("Item text is required")],
            }),
          ],
          preview: {
            select: { title: "text" },
          },
        }),
      ],
      validation: (Rule) => [
        Rule.required().min(3).error("Add at least three items to order"),
        Rule.max(8).warning("Keep to 8 or fewer items for a manageable drag list"),
      ],
    }),
  ],
  preview: {
    select: { title: "prompt" },
    prepare({ title }) {
      return {
        title: title || "Untitled question",
        subtitle: "Put in Order",
      };
    },
  },
});
