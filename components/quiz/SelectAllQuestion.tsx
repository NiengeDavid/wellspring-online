"use client";

import { Check } from "lucide-react";
import type { SafeQuestion } from "@/lib/quiz-types";

interface SelectAllQuestionProps {
  question: Extract<SafeQuestion, { type: "selectAllQuestion" }>;
  value: string[] | undefined;
  onChange: (selectedOptionKeys: string[]) => void;
}

export function SelectAllQuestion({
  question,
  value,
  onChange,
}: SelectAllQuestionProps) {
  const selected = value ?? [];

  const toggle = (key: string) => {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-zinc-500">Select all that apply</p>
      {question.options.map((option) => {
        const isChecked = selected.includes(option.key);
        return (
          <button
            type="button"
            key={option.key}
            onClick={() => toggle(option.key)}
            aria-pressed={isChecked}
            className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
              isChecked
                ? "border-violet-500 bg-violet-500/10"
                : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                isChecked
                  ? "border-violet-500 bg-violet-500"
                  : "border-zinc-600"
              }`}
            >
              {isChecked && <Check className="h-3 w-3 text-white" />}
            </span>
            <span className="text-sm text-zinc-200">{option.text}</span>
          </button>
        );
      })}
    </div>
  );
}
