import { ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";

interface QuizCalloutProps {
  quizId: string;
  title: string;
  label: string;
}

export function QuizCallout({ quizId, title, label }: QuizCalloutProps) {
  return (
    <Link
      href={`/quizzes/${quizId}`}
      className="flex items-center gap-4 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 p-5 transition-colors hover:border-violet-500/50 hover:from-violet-500/15 hover:to-fuchsia-500/15"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
        <HelpCircle className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
          {label}
        </p>
        <p className="font-semibold text-zinc-100 truncate">{title}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-500" />
    </Link>
  );
}
