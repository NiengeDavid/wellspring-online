// Shared types for the quiz feature, used by both the server actions
// (lib/actions/quizzes.ts) and the quiz-taking client components.

export interface SafeOption {
  key: string;
  text: string;
}

export type SafeQuestion =
  | {
      key: string;
      type: "multipleChoiceQuestion";
      prompt: string;
      points: number;
      options: SafeOption[];
    }
  | {
      key: string;
      type: "selectAllQuestion";
      prompt: string;
      points: number;
      options: SafeOption[];
    }
  | {
      key: string;
      type: "fillInQuestion";
      prompt: string;
      points: number;
    }
  | {
      key: string;
      type: "orderingQuestion";
      prompt: string;
      points: number;
      items: SafeOption[];
    }
  | {
      key: string;
      type: "matchingQuestion";
      prompt: string;
      points: number;
      leftItems: SafeOption[];
      rightItems: SafeOption[];
    };

export type SubmittedAnswer =
  | {
      questionKey: string;
      type: "multipleChoiceQuestion";
      selectedOptionKey: string;
    }
  | {
      questionKey: string;
      type: "selectAllQuestion";
      selectedOptionKeys: string[];
    }
  | { questionKey: string; type: "fillInQuestion"; text: string }
  | { questionKey: string; type: "orderingQuestion"; orderedItemKeys: string[] }
  | {
      questionKey: string;
      type: "matchingQuestion";
      pairs: { leftKey: string; chosenRightKey: string }[];
    };

export interface GradedQuestion {
  questionKey: string;
  isCorrect: boolean;
  pointsAwarded: number;
  maxPoints: number;
}
