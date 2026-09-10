"use client";

import { DocumentList } from "@/components/admin/documents/DocumentList";
import { dataset, projectId } from "@/sanity/env";

export default function QuizzesPage() {
  return (
    <DocumentList
      documentType="quiz"
      title="Quizzes"
      description="Create quizzes for lessons, modules, and courses"
      basePath="/admin/quizzes"
      projectId={projectId}
      dataset={dataset}
    />
  );
}
