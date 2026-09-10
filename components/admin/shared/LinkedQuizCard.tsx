"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useQuery,
  useApplyDocumentActions,
  useEditDocument,
  createDocument,
  createDocumentHandle,
} from "@sanity/sdk-react";
import { ExternalLink, HelpCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ParentType = "lesson" | "module" | "course";

interface LinkedQuizCardProps {
  documentId: string;
  documentType: ParentType;
  projectId: string;
  dataset: string;
  parentTitle: string;
}

function LinkedQuizCardFallback() {
  return <Skeleton className="h-20 w-full bg-zinc-800" />;
}

function LinkedQuizCardContent({
  documentId,
  documentType,
  projectId,
  dataset,
  parentTitle,
}: LinkedQuizCardProps) {
  const router = useRouter();
  const apply = useApplyDocumentActions();
  const [isCreating, startTransition] = useTransition();
  const [newQuizId] = useState(() => crypto.randomUUID());

  const baseId = documentId.replace("drafts.", "");

  const { data: quiz } = useQuery<{ _id: string; title: string | null } | null>({
    query: `*[_type == "quiz" && ${documentType}._ref == $id][0]{ _id, title }`,
    params: { id: baseId },
    projectId,
    dataset,
  });

  const editRef = useEditDocument({
    documentId: newQuizId,
    documentType: "quiz",
    projectId,
    dataset,
    path: documentType,
  });
  const editTitle = useEditDocument<string>({
    documentId: newQuizId,
    documentType: "quiz",
    projectId,
    dataset,
    path: "title",
  });

  const handleCreate = () => {
    startTransition(async () => {
      const newDocHandle = createDocumentHandle({
        documentId: newQuizId,
        documentType: "quiz",
      });
      await apply(createDocument(newDocHandle));
      editRef({ _type: "reference", _ref: baseId });
      editTitle(`${parentTitle} Quiz`);
      router.push(`/admin/quizzes/${newQuizId}`);
    });
  };

  if (quiz) {
    return (
      <Link
        href={`/admin/quizzes/${quiz._id}`}
        className="flex items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-500/10 p-4 transition-colors hover:border-violet-500/50 hover:bg-violet-500/15"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
          <HelpCircle className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-violet-400">Linked Quiz</p>
          <p className="font-medium text-zinc-100 truncate">{quiz.title || "Untitled Quiz"}</p>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500" />
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-zinc-700 p-4">
      <p className="text-sm text-zinc-500">No quiz attached yet</p>
      <Button type="button" variant="outline" size="sm" onClick={handleCreate} disabled={isCreating} className="gap-1.5">
        {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        Create Quiz
      </Button>
    </div>
  );
}

export function LinkedQuizCard(props: LinkedQuizCardProps) {
  return (
    <Suspense fallback={<LinkedQuizCardFallback />}>
      <LinkedQuizCardContent {...props} />
    </Suspense>
  );
}
