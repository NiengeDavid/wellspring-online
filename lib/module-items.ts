// Builds the ordered "outline" for a module: each lesson, immediately followed
// by that lesson's quiz (if any), followed by the module's own quiz (if any) last.
// Items unlock sequentially within a module — the first item is always open,
// each later item requires the previous item to be completed.

interface LessonLike {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  completedBy?: string[] | null;
  quiz?: {
    _id: string;
    title?: string | null;
    completedBy?: string[] | null;
  } | null;
}

interface ModuleLike {
  _id: string;
  lessons?: LessonLike[] | null;
  quiz?: {
    _id: string;
    title?: string | null;
    completedBy?: string[] | null;
  } | null;
}

export interface LessonOutlineItem {
  type: "lesson";
  id: string;
  title: string;
  slug: string | null;
  completed: boolean;
  unlocked: boolean;
}

export interface QuizOutlineItem {
  type: "quiz";
  id: string;
  title: string;
  completed: boolean;
  unlocked: boolean;
}

export type ModuleOutlineItem = LessonOutlineItem | QuizOutlineItem;

function isCompleted(
  completedBy: string[] | null | undefined,
  userId: string | null,
): boolean {
  if (!userId || !completedBy) return false;
  return completedBy.includes(userId);
}

export function buildModuleOutline(
  module: ModuleLike,
  userId: string | null,
): ModuleOutlineItem[] {
  const raw: (
    | Omit<LessonOutlineItem, "unlocked">
    | Omit<QuizOutlineItem, "unlocked">
  )[] = [];

  for (const lesson of module.lessons ?? []) {
    raw.push({
      type: "lesson",
      id: lesson._id,
      title: lesson.title ?? "Untitled Lesson",
      slug: lesson.slug?.current ?? null,
      completed: isCompleted(lesson.completedBy, userId),
    });
    if (lesson.quiz) {
      raw.push({
        type: "quiz",
        id: lesson.quiz._id,
        title: lesson.quiz.title ?? "Lesson Quiz",
        completed: isCompleted(lesson.quiz.completedBy, userId),
      });
    }
  }

  if (module.quiz) {
    raw.push({
      type: "quiz",
      id: module.quiz._id,
      title: module.quiz.title ?? "Module Quiz",
      completed: isCompleted(module.quiz.completedBy, userId),
    });
  }

  return raw.map((item, index) => ({
    ...item,
    unlocked: index === 0 || raw[index - 1].completed,
  })) as ModuleOutlineItem[];
}

export function findOutlineItem(
  items: ModuleOutlineItem[],
  id: string,
): ModuleOutlineItem | undefined {
  return items.find((item) => item.id === id);
}
