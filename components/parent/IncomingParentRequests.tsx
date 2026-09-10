"use client";

import { Check, Loader2, User, X } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveIncomingRequest, denyIncomingRequest } from "@/lib/actions";

interface IncomingRequest {
  linkId: string;
  parentName: string;
  parentEmail: string | null;
}

interface IncomingParentRequestsProps {
  pendingRequests: IncomingRequest[];
  approvedParents: IncomingRequest[];
}

function RequestRow({ request }: { request: IncomingRequest }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-500/10 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
        <User className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-100 truncate">
          {request.parentName}
        </p>
        {request.parentEmail && (
          <p className="text-sm text-zinc-500 truncate">
            {request.parentEmail}
          </p>
        )}
        <p className="text-xs text-violet-400 mt-0.5">
          Wants to follow your progress
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await approveIncomingRequest(request.linkId);
            })
          }
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await denyIncomingRequest(request.linkId);
            })
          }
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5"
        >
          <X className="h-3.5 w-3.5" />
          Deny
        </Button>
      </div>
    </div>
  );
}

export function IncomingParentRequests({
  pendingRequests,
  approvedParents,
}: IncomingParentRequestsProps) {
  if (pendingRequests.length === 0 && approvedParents.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4">Your Parents</h2>
      <div className="flex flex-col gap-3">
        {pendingRequests.map((request) => (
          <RequestRow key={request.linkId} request={request} />
        ))}

        {approvedParents.map((parent) => (
          <div
            key={parent.linkId}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-200 truncate">
                {parent.parentName}
              </p>
              {parent.parentEmail && (
                <p className="text-sm text-zinc-500 truncate">
                  {parent.parentEmail}
                </p>
              )}
            </div>
            <span className="text-xs text-emerald-400 shrink-0">
              Following your progress
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
