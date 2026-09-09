"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/lib/actions";

export function AcceptInviteButton({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAccept = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAccepted(true);
    });
  };

  if (accepted) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        <p className="text-zinc-200">
          You're linked! They can now see your progress.
        </p>
        <Link href="/dashboard">
          <Button className="bg-violet-600 hover:bg-violet-500 text-white">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleAccept}
        disabled={isPending}
        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0"
      >
        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Accept Invite
      </Button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
