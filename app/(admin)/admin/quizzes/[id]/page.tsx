"use client";

import { use } from "react";
import { QuizEditor } from "@/components/admin/editors/QuizEditor";
import { dataset, projectId } from "@/sanity/env";

export default function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <QuizEditor documentId={id} projectId={projectId} dataset={dataset} />;
}
