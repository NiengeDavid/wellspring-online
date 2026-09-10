"use client";

import { LessonList } from "@/components/admin/documents/LessonList";
import { dataset, projectId } from "@/sanity/env";

export default function LessonsPage() {
  return <LessonList projectId={projectId} dataset={dataset} />;
}
