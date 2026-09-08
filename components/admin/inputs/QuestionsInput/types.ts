import type { DocumentHandle } from "@sanity/sdk-react";

export interface QuestionOption {
  _key: string;
  text?: string;
  isCorrect?: boolean;
}

export interface QuestionItem {
  _key: string;
  text?: string;
}

export interface QuestionPair {
  _key: string;
  left?: string;
  right?: string;
}

export interface QuestionBase {
  _key: string;
  prompt?: string;
  points?: number;
}

export type MultipleChoiceQuestion = QuestionBase & {
  _type: "multipleChoiceQuestion";
  options?: QuestionOption[];
};

export type SelectAllQuestion = QuestionBase & {
  _type: "selectAllQuestion";
  options?: QuestionOption[];
};

export type FillInQuestion = QuestionBase & {
  _type: "fillInQuestion";
  acceptableAnswers?: string[];
};

export type OrderingQuestion = QuestionBase & {
  _type: "orderingQuestion";
  items?: QuestionItem[];
};

export type MatchingQuestion = QuestionBase & {
  _type: "matchingQuestion";
  pairs?: QuestionPair[];
};

export type AdminQuestion =
  | MultipleChoiceQuestion
  | SelectAllQuestion
  | FillInQuestion
  | OrderingQuestion
  | MatchingQuestion;

export const QUESTION_TYPE_LABELS: Record<AdminQuestion["_type"], string> = {
  multipleChoiceQuestion: "Multiple Choice",
  selectAllQuestion: "Select All That Apply",
  fillInQuestion: "Fill in the Blank",
  orderingQuestion: "Put in Order",
  matchingQuestion: "Matching",
};

export function createQuestion(type: AdminQuestion["_type"]): AdminQuestion {
  const key = crypto.randomUUID();
  switch (type) {
    case "multipleChoiceQuestion":
      return {
        _key: key,
        _type: type,
        prompt: "",
        points: 10,
        options: [
          { _key: crypto.randomUUID(), text: "", isCorrect: false },
          { _key: crypto.randomUUID(), text: "", isCorrect: false },
        ],
      };
    case "selectAllQuestion":
      return {
        _key: key,
        _type: type,
        prompt: "",
        points: 10,
        options: [
          { _key: crypto.randomUUID(), text: "", isCorrect: false },
          { _key: crypto.randomUUID(), text: "", isCorrect: false },
          { _key: crypto.randomUUID(), text: "", isCorrect: false },
        ],
      };
    case "fillInQuestion":
      return {
        _key: key,
        _type: type,
        prompt: "",
        points: 10,
        acceptableAnswers: [""],
      };
    case "orderingQuestion":
      return {
        _key: key,
        _type: type,
        prompt: "",
        points: 10,
        items: [
          { _key: crypto.randomUUID(), text: "" },
          { _key: crypto.randomUUID(), text: "" },
          { _key: crypto.randomUUID(), text: "" },
        ],
      };
    case "matchingQuestion":
      return {
        _key: key,
        _type: type,
        prompt: "",
        points: 10,
        pairs: [
          { _key: crypto.randomUUID(), left: "", right: "" },
          { _key: crypto.randomUUID(), left: "", right: "" },
          { _key: crypto.randomUUID(), left: "", right: "" },
        ],
      };
  }
}

export interface QuestionsInputProps extends DocumentHandle {
  path: string;
  label: string;
}
