"use client";

import { ChevronRight, Clock, Loader2, User, X } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { removeChildLink } from "@/lib/actions";

interface Child {
  linkId: string;
  childId: string;
  name: string;
  email: string | null;
  imageUrl: string | null;
}

interface PendingInvite {
  _id: string;
  childEmail: string | null;
}

interface ChildrenListProps {
  linkedChildren: Child[];
  pendingInvites: PendingInvite[];
}

function RemoveButton({
  linkId,
  confirmMessage,
}: {
  linkId: string;
  confirmMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={isPending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await removeChildLink(linkId);
        });
      }}
      className="text-zinc-500 hover:text-red-400 shrink-0"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function ChildrenList({
  linkedChildren,
  pendingInvites,
}: ChildrenListProps) {
  if (linkedChildren.length === 0 && pendingInvites.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No children linked yet. Invite one above to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {linkedChildren.map((child) => (
        <div
          key={child.linkId}
          className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 pr-2 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors group"
        >
          <Link
            href={`/parent/children/${child.childId}`}
            className="flex flex-1 min-w-0 items-center gap-3 p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
              {child.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={child.imageUrl}
                  alt={child.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-100 truncate">{child.name}</p>
              {child.email && (
                <p className="text-sm text-zinc-500 truncate">{child.email}</p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
          </Link>
          <RemoveButton
            linkId={child.linkId}
            confirmMessage={`Stop following ${child.name}'s progress? You'll need a new invite to link again.`}
          />
        </div>
      ))}

      {pendingInvites.map((invite) => (
        <div
          key={invite._id}
          className="flex items-center gap-3 rounded-lg border border-dashed border-zinc-700 p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-zinc-300 truncate">
              {invite.childEmail}
            </p>
            <p className="text-sm text-zinc-500">
              Invite sent — awaiting acceptance
            </p>
          </div>
          <RemoveButton linkId={invite._id} />
        </div>
      ))}
    </div>
  );
}
