"use client";

import { CourseList } from "@/components/admin/documents/CourseList";
import { dataset, projectId } from "@/sanity/env";

export default function CoursesPage() {
  return <CourseList projectId={projectId} dataset={dataset} />;
}
