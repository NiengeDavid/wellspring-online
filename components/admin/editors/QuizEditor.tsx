"use client";

import type { DocumentHandle } from "@sanity/sdk-react";
import { useDocument, useEditDocument } from "@sanity/sdk-react";
import { Suspense } from "react";
import { DocumentActions } from "@/components/admin/documents/DocumentActions";
import { OpenInStudio } from "@/components/admin/documents/OpenInStudio";
import { NumberInput } from "@/components/admin/inputs/NumberInput";
import { QuestionsInput } from "@/components/admin/inputs/QuestionsInput";
import { ReferenceInput } from "@/components/admin/inputs/ReferenceInput";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizEditorProps {
  documentId: string;
  projectId: string;
  dataset: string;
}

function QuizEditorFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-2/3 bg-zinc-800" />
      <Skeleton className="h-20 w-full bg-zinc-800" />
      <Skeleton className="h-[400px] w-full bg-zinc-800" />
    </div>
  );
}

function QuizEditorContent({
  documentId,
  projectId,
  dataset,
}: QuizEditorProps) {
  const handle: DocumentHandle = {
    documentId,
    documentType: "quiz",
    projectId,
    dataset,
  };

  const { data: title } = useDocument<string>({ ...handle, path: "title" });
  const editTitle = useEditDocument<string>({ ...handle, path: "title" });

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <OpenInStudio handle={handle} />
      </div>

      {/* Header section */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 mb-6">
        <Input
          value={title ?? ""}
          onChange={(e) => editTitle(e.currentTarget.value)}
          placeholder="Untitled Quiz"
          className="text-2xl font-semibold text-white border-none shadow-none h-auto py-1 focus-visible:ring-0 bg-transparent placeholder:text-zinc-600"
        />

        <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-800">
          <DocumentActions {...handle} />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main: Questions */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
          <QuestionsInput {...handle} path="questions" label="Questions" />
        </div>

        {/* Sidebar: Settings */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 space-y-5 h-fit">
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">
              Attach this quiz to exactly one of the levels below — a lesson
              quiz, a module review, or a course final exam.
            </p>
            <ReferenceInput
              {...handle}
              path="lesson"
              label="Lesson"
              referenceType="lesson"
              placeholder="None"
            />
            <ReferenceInput
              {...handle}
              path="module"
              label="Module"
              referenceType="module"
              placeholder="None"
            />
            <ReferenceInput
              {...handle}
              path="course"
              label="Course"
              referenceType="course"
              placeholder="None"
            />
          </div>
          <NumberInput
            {...handle}
            path="passingScorePercent"
            label="Passing Score (%)"
            min={0}
            max={100}
          />
        </div>
      </div>
    </div>
  );
}

export function QuizEditor(props: QuizEditorProps) {
  return (
    <Suspense fallback={<QuizEditorFallback />}>
      <QuizEditorContent {...props} />
    </Suspense>
  );
}
