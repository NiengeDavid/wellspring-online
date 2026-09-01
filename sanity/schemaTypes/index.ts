import type { SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { courseType } from "./courseType";
import { lessonType } from "./lessonType";
import { moduleType } from "./moduleType";
import { noteType } from "./noteType";
import { pointsTransactionType } from "./pointsTransactionType";
import { fillInQuestionType } from "./questions/fillInQuestionType";
import { matchingQuestionType } from "./questions/matchingQuestionType";
import { multipleChoiceQuestionType } from "./questions/multipleChoiceQuestionType";
import { orderingQuestionType } from "./questions/orderingQuestionType";
import { selectAllQuestionType } from "./questions/selectAllQuestionType";
import { quizAttemptType } from "./quizAttemptType";
import { quizType } from "./quizType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    courseType,
    moduleType,
    lessonType,
    categoryType,
    noteType,
    multipleChoiceQuestionType,
    selectAllQuestionType,
    fillInQuestionType,
    orderingQuestionType,
    matchingQuestionType,
    quizType,
    quizAttemptType,
    pointsTransactionType,
  ],
};
