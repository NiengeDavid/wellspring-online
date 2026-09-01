import { HelpCircleIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const quizType = defineType({
  name: "quiz",
  title: "Quiz",
  type: "document",
  icon: HelpCircleIcon,
  groups: [
    { name: "details", title: "Details", icon: HelpCircleIcon, default: true },
    { name: "questions", title: "Questions" },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      group: "details",
      validation: (Rule) => [Rule.required().error("Quiz title is required")],
    }),
    defineField({
      name: "lesson",
      type: "reference",
      group: "details",
      to: [{ type: "lesson" }],
      description: "Attach this quiz to a lesson. Leave empty for a module or course-level quiz.",
    }),
    defineField({
      name: "module",
      type: "reference",
      group: "details",
      to: [{ type: "module" }],
      description: "Attach this quiz to a module (e.g. a module review). Leave empty otherwise.",
    }),
    defineField({
      name: "course",
      type: "reference",
      group: "details",
      to: [{ type: "course" }],
      description: "Attach this quiz to a whole course (e.g. a final exam). Leave empty otherwise.",
    }),
    defineField({
      name: "passingScorePercent",
      type: "number",
      group: "details",
      initialValue: 70,
      validation: (Rule) => [
        Rule.required().min(0).max(100).error("Passing score must be between 0 and 100"),
      ],
    }),
    defineField({
      name: "questions",
      type: "array",
      group: "questions",
      of: [
        defineArrayMember({ type: "multipleChoiceQuestion" }),
        defineArrayMember({ type: "selectAllQuestion" }),
        defineArrayMember({ type: "fillInQuestion" }),
        defineArrayMember({ type: "orderingQuestion" }),
        defineArrayMember({ type: "matchingQuestion" }),
      ],
      validation: (Rule) => [Rule.required().min(1).error("Add at least one question")],
    }),
  ],
  preview: {
    select: {
      title: "title",
      lessonTitle: "lesson.title",
      moduleTitle: "module.title",
      courseTitle: "course.title",
      questions: "questions",
    },
    prepare({ title, lessonTitle, moduleTitle, courseTitle, questions }) {
      const attachedTo = lessonTitle || moduleTitle || courseTitle || "Unattached";
      const questionCount = questions?.length ?? 0;
      return {
        title: title || "Untitled Quiz",
        subtitle: `${attachedTo} • ${questionCount} question${questionCount === 1 ? "" : "s"}`,
        media: HelpCircleIcon,
      };
    },
  },
});
