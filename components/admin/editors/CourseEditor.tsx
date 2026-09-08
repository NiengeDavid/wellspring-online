"use client";

import type { DocumentHandle } from "@sanity/sdk-react";
import { useDocument, useEditDocument } from "@sanity/sdk-react";
import { Suspense } from "react";
import { DocumentActions } from "@/components/admin/documents/DocumentActions";
import { OpenInStudio } from "@/components/admin/documents/OpenInStudio";
import { ImageInput } from "@/components/admin/inputs/ImageInput";
import { ModuleAccordionInput } from "@/components/admin/inputs/ModuleAccordionInput";
import { ReferenceInput } from "@/components/admin/inputs/ReferenceInput";
import { SelectInput } from "@/components/admin/inputs/SelectInput";
import { SlugInput } from "@/components/admin/inputs/SlugInput";
import { SwitchInput } from "@/components/admin/inputs/SwitchInput";
import { LinkedQuizCard } from "@/components/admin/shared/LinkedQuizCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { TIER_OPTIONS } from "@/lib/constants";

interface CourseEditorProps {
  documentId: string;
  projectId: string;
  dataset: string;
}

function CourseEditorFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-2/3 bg-zinc-800" />
      <Skeleton className="h-20 w-full bg-zinc-800" />
      <Skeleton className="h-[400px] w-full bg-zinc-800" />
    </div>
  );
}

function CourseEditorContent({
  documentId,
  projectId,
  dataset,
}: CourseEditorProps) {
  const handle: DocumentHandle = {
    documentId,
    documentType: "course",
    projectId,
    dataset,
  };

  const { data: title } = useDocument<string>({ ...handle, path: "title" });
  const { data: description } = useDocument<string>({
    ...handle,
    path: "description",
  });
  const editTitle = useEditDocument<string>({ ...handle, path: "title" });
  const editDescription = useEditDocument<string>({
    ...handle,
    path: "description",
  });

  return (
    <div>
      <div className="flex items-center justify-end mb-3">
        <OpenInStudio handle={handle} />
      </div>

      {/* Header section */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 mb-6">
        {/* Title input */}
        <Input
          value={title ?? ""}
          onChange={(e) => editTitle(e.currentTarget.value)}
          placeholder="Untitled Course"
          className="text-2xl font-semibold text-white border-none shadow-none h-auto py-1 focus-visible:ring-0 bg-transparent placeholder:text-zinc-600"
        />

        {/* Description */}
        <Textarea
          value={description ?? ""}
          onChange={(e) => editDescription(e.currentTarget.value)}
          placeholder="Add a description..."
          className="text-zinc-400 border-none shadow-none resize-none focus-visible:ring-0 bg-transparent placeholder:text-zinc-600 mt-2"
          rows={2}
        />

        {/* Actions */}
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-zinc-800">
          <DocumentActions {...handle} />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main: Modules */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6">
          <ModuleAccordionInput
            documentId={documentId}
            documentType="course"
            projectId={projectId}
            dataset={dataset}
            path="modules"
            label="Modules"
          />
        </div>

        {/* Sidebar: Settings */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 space-y-5 h-fit">
          <ImageInput {...handle} path="thumbnail" label="Thumbnail" />
          <ReferenceInput
            {...handle}
            path="category"
            label="Category"
            referenceType="category"
            placeholder="Select category"
          />
          <SelectInput
            {...handle}
            path="tier"
            label="Access Tier"
            options={TIER_OPTIONS}
          />
          <SwitchInput
            {...handle}
            path="featured"
            label="Featured"
            description="Show on homepage"
          />
          <SlugInput
            {...handle}
            path="slug"
            label="URL Slug"
            sourceField="title"
          />
          <div className="pt-1 border-t border-zinc-800">
            <p className="text-xs font-medium text-zinc-500 mb-2 mt-4">Final Exam</p>
            <LinkedQuizCard
              documentId={documentId}
              documentType="course"
              projectId={projectId}
              dataset={dataset}
              parentTitle={title || "Course"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseEditor(props: CourseEditorProps) {
  return (
    <Suspense fallback={<CourseEditorFallback />}>
      <CourseEditorContent {...props} />
    </Suspense>
  );
}
