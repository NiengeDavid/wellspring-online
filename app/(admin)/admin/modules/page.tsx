"use client";

import { ModuleList } from "@/components/admin/documents/ModuleList";
import { dataset, projectId } from "@/sanity/env";

export default function ModulesPage() {
  return <ModuleList projectId={projectId} dataset={dataset} />;
}
