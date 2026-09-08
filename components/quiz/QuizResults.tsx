"use client";

import { CheckCircle2, RotateCcw, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { GradedQuestion } from "@/lib/quiz-types";

interface QuizResultsProps {
  scorePercent: number;
  passed: boolean;
  pointsAwarded: number;
  pointsWithheldReason: "already_earned" | null;
  questions: GradedQuestion[];
  onRetake: () => void;
  backHref: string;
  backLabel: string;
}

export function QuizResults({
  scorePercent,
  passed,
  pointsAwarded,
  pointsWithheldReason,
  questions,
  onRetake,
  backHref,
  backLabel,
}: QuizResultsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div
        className={`rounded-xl border p-8 text-center ${
          passed
            ? "border-emerald-500/30 bg-emerald-500/10"
            : "border-red-500/30 bg-red-500/10"
        }`}
      >
        {passed ? (
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
        ) : (
          <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
        )}
        <h2 className="text-2xl font-bold text-zinc-100 mb-1">
          {passed ? "Quiz Passed!" : "Not Quite — Try Again"}
        </h2>
        <p className="text-zinc-400 mb-4">You scored {scorePercent}%</p>

        {pointsAwarded > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-amber-300">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">
              +{pointsAwarded} points earned!
            </span>
          </div>
        ) : pointsWithheldReason === "already_earned" ? (
          <p className="text-xs text-zinc-500">
            Points were already awarded for this quiz on a previous attempt.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q, index) => (
          <div
            key={q.questionKey}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
          >
            <span className="text-sm text-zinc-400">Question {index + 1}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">
                {q.pointsAwarded}/{q.maxPoints} pts
              </span>
              {q.isCorrect ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link href={backHref}>
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            {backLabel}
          </Button>
        </Link>
        <Button
          onClick={onRetake}
          variant="outline"
          className="border-zinc-700 text-zinc-200 hover:bg-zinc-800"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}
