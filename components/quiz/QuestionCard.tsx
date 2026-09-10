import { StarIcon } from "lucide-react";
import type { ReactNode } from "react";

interface QuestionCardProps {
  index: number;
  total: number;
  prompt: string;
  points: number;
  children: ReactNode;
}

export function QuestionCard({
  index,
  total,
  prompt,
  points,
  children,
}: QuestionCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-medium text-violet-400 mb-1">
            Question {index + 1} of {total}
          </p>
          <h2 className="text-lg md:text-xl font-semibold text-zinc-100">
            {prompt}
          </h2>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-300">
          <StarIcon className="h-3 w-3" />
          {points}
        </span>
      </div>
      {children}
    </div>
  );
}
