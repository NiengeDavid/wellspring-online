import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LockedFallbackProps {
  backHref: string;
  backLabel: string;
}

export function LockedFallback({ backHref, backLabel }: LockedFallbackProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 md:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700 mb-6">
        <Lock className="w-7 h-7 text-zinc-400" />
      </div>
      <h2 className="text-2xl font-bold mb-3">This quiz is locked</h2>
      <p className="text-zinc-400 mb-8 max-w-md mx-auto">
        Complete the previous lesson or quiz first to unlock this one.
      </p>
      <Link href={backHref}>
        <Button className="bg-violet-600 hover:bg-violet-500 text-white">
          {backLabel}
        </Button>
      </Link>
    </div>
  );
}
