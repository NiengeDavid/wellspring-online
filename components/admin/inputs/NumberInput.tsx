"use client";

import {
  type DocumentHandle,
  useDocument,
  useEditDocument,
} from "@sanity/sdk-react";
import { Suspense } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface NumberInputProps extends DocumentHandle {
  path: string;
  label: string;
  min?: number;
  max?: number;
  description?: string;
}

function NumberInputFallback({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

function NumberInputField({
  path,
  label,
  min,
  max,
  description,
  ...handle
}: NumberInputProps) {
  const { data: value } = useDocument({ ...handle, path });
  const editValue = useEditDocument({ ...handle, path });

  return (
    <div className="space-y-2">
      <Label htmlFor={path}>{label}</Label>
      <Input
        id={path}
        type="number"
        min={min}
        max={max}
        value={(value as number) ?? ""}
        onChange={(e) => {
          const parsed = Number(e.currentTarget.value);
          editValue(
            e.currentTarget.value === "" || Number.isNaN(parsed)
              ? null
              : parsed,
          );
        }}
      />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function NumberInput(props: NumberInputProps) {
  return (
    <Suspense fallback={<NumberInputFallback label={props.label} />}>
      <NumberInputField {...props} />
    </Suspense>
  );
}
