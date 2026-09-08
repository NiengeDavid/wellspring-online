"use client";

import { Input } from "@/components/ui/input";
import type { SafeQuestion } from "@/lib/quiz-types";

interface FillInQuestionProps {
  question: Extract<SafeQuestion, { type: "fillInQuestion" }>;
  value: string | undefined;
  onChange: (text: string) => void;
}

export function FillInQuestion({ value, onChange }: FillInQuestionProps) {
  return (
    <Input
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer..."
      className="bg-zinc-900/50 border-zinc-800 text-zinc-200 h-12"
      autoComplete="off"
    />
  );
}
