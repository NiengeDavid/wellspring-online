import { UsersIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const parentLinkType = defineType({
  name: "parentLink",
  title: "Parent Link",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "parent",
      type: "string",
      description: "Clerk user ID of the parent account",
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "childEmail",
      type: "string",
      description: "Email address the parent invited",
      validation: (Rule) => [Rule.required().email()],
    }),
    defineField({
      name: "child",
      type: "string",
      description:
        "Clerk user ID of the linked child, set once the invite is accepted",
    }),
    defineField({
      name: "status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Accepted", value: "accepted" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => [Rule.required()],
    }),
    defineField({
      name: "token",
      type: "string",
      description: "Secure token used in the invite acceptance link",
      validation: (Rule) => [Rule.required()],
    }),
  ],
  preview: {
    select: {
      childEmail: "childEmail",
      status: "status",
    },
    prepare({ childEmail, status }) {
      return {
        title: childEmail || "Unknown email",
        subtitle: status,
        media: UsersIcon,
      };
    },
  },
});
