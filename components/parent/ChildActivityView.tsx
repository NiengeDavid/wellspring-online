import { BookOpen, CheckCircle2, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";
import type { getChildActivity } from "@/lib/actions/parent";

type ChildActivity = NonNullable<Awaited<ReturnType<typeof getChildActivity>>>;

interface ChildActivityViewProps {
  activity: ChildActivity;
}

export function ChildActivityView({ activity }: ChildActivityViewProps) {
  const { courseProgress, attempts, pointsBalance } = activity;

  return (
    <div className="flex flex-col gap-8">
      {/* Points balance */}
      <div className="flex items-center gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-zinc-100">
            {pointsBalance} points
          </p>
          <p className="text-sm text-zinc-400">Earned from quizzes</p>
        </div>
      </div>

      {/* Course progress */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-violet-400" />
          Course Progress
        </h2>
        {courseProgress.length > 0 ? (
          <div className="flex flex-col gap-2">
            {courseProgress.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-200">{course.title}</p>
                  <p className="text-xs text-zinc-500">
                    {course.completedLessons}/{course.totalLessons} lessons
                    complete
                  </p>
                </div>
                {course.isCompleted && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No courses started yet.</p>
        )}
      </div>

      {/* Quiz attempts */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quiz Attempts</h2>
        {attempts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {attempts.map((attempt) => (
              <div
                key={attempt._id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-zinc-200">
                    {attempt.quiz?.title ?? "Untitled Quiz"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {attempt.scorePercent}% • {attempt.totalPointsAwarded} pts
                  </p>
                </div>
                {attempt.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">No quizzes attempted yet.</p>
        )}
      </div>

      <Link
        href="/parent"
        className="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        ← Back to Parent Portal
      </Link>
    </div>
  );
}
