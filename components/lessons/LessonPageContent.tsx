"use client";

import { BookOpen, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { GatedFallback } from "@/components/courses/GatedFallback";
import { LockedFallback } from "@/components/quiz";
import { Button } from "@/components/ui/button";
import { hasTierAccess, useUserTier } from "@/lib/hooks/use-user-tier";
import { buildModuleOutline, type ModuleOutlineItem } from "@/lib/module-items";
import type { LESSON_BY_ID_QUERYResult } from "@/sanity.types";
import { LessonCompleteButton } from "./LessonCompleteButton";
import { LessonContent } from "./LessonContent";
import { LessonSidebar } from "./LessonSidebar";
import { MuxVideoPlayer } from "./MuxVideoPlayer";

interface LessonPageContentProps {
  lesson: NonNullable<LESSON_BY_ID_QUERYResult>;
  userId: string | null;
}

function itemHref(item: ModuleOutlineItem): string {
  return item.type === "lesson"
    ? `/lessons/${item.slug}`
    : `/quizzes/${item.id}`;
}

export function LessonPageContent({ lesson, userId }: LessonPageContentProps) {
  const userTier = useUserTier();

  // Find the first course the user has access to (courses are sorted by tier: free, pro, ultra)
  // This allows users to access lessons if they have access to ANY course containing the lesson
  const courses = lesson.courses ?? [];
  const accessibleCourse = courses.find((course) =>
    hasTierAccess(userTier, course.tier),
  );
  const hasAccess = !!accessibleCourse;

  // Use the accessible course for navigation, or fall back to the first course for gated fallback
  const activeCourse = accessibleCourse ?? courses[0];

  // Check if user has completed this lesson
  const isCompleted = userId
    ? (lesson.completedBy?.includes(userId) ?? false)
    : false;

  // Flatten every module's outline (lessons + their quizzes + the module's own quiz)
  // into one ordered list, so prev/next navigation can move across lesson AND quiz items.
  const modules = activeCourse?.modules ?? [];
  const allItems: ModuleOutlineItem[] = modules.flatMap((module) =>
    buildModuleOutline(module, userId ?? null),
  );

  const currentIndex = allItems.findIndex(
    (item) => item.type === "lesson" && item.id === lesson._id,
  );
  const currentItem = currentIndex >= 0 ? allItems[currentIndex] : undefined;
  const isLocked = currentItem ? !currentItem.unlocked : false;

  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < allItems.length - 1
      ? allItems[currentIndex + 1]
      : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      {activeCourse && hasAccess && (
        <LessonSidebar
          courseSlug={activeCourse.slug!.current!}
          courseTitle={activeCourse.title}
          modules={activeCourse.modules ?? null}
          currentLessonId={lesson._id}
          userId={userId}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {!hasAccess ? (
          <GatedFallback requiredTier={activeCourse?.tier} />
        ) : isLocked ? (
          <LockedFallback
            backHref={
              activeCourse
                ? `/courses/${activeCourse.slug!.current!}`
                : "/dashboard"
            }
            backLabel="Back to Course"
          />
        ) : (
          <>
            {/* Video Player */}
            {lesson.video?.asset?.playbackId && (
              <MuxVideoPlayer
                playbackId={lesson.video?.asset?.playbackId}
                title={lesson.title ?? undefined}
                className="mb-6"
              />
            )}

            {/* Lesson Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {lesson.title ?? "Untitled Lesson"}
                </h1>
                {lesson.description && (
                  <p className="text-zinc-400">{lesson.description}</p>
                )}
              </div>

              {userId && (
                <LessonCompleteButton
                  lessonId={lesson._id}
                  lessonSlug={lesson.slug!.current!}
                  isCompleted={isCompleted}
                />
              )}
            </div>

            {/* Lesson Content */}
            {lesson.content && (
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-semibold">Lesson Notes</h2>
                </div>
                <LessonContent content={lesson.content} />
              </div>
            )}

            {/* Navigation between lessons/quizzes */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
              {prevItem ? (
                <Link href={itemHref(prevItem)}>
                  <Button
                    variant="ghost"
                    className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{prevItem.title}</span>
                    <span className="sm:hidden">Previous</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {nextItem ? (
                nextItem.unlocked ? (
                  <Link href={itemHref(nextItem)}>
                    <Button className="bg-violet-600 hover:bg-violet-500 text-white">
                      <span className="hidden sm:inline">{nextItem.title}</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    className="border-zinc-700 text-zinc-500"
                    title="Complete this lesson to continue"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">
                      Complete to continue
                    </span>
                    <span className="sm:hidden">Locked</span>
                  </Button>
                )
              ) : (
                <div />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
