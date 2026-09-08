"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SafeQuestion } from "@/lib/quiz-types";

interface MultipleChoiceQuestionProps {
  question: Extract<SafeQuestion, { type: "multipleChoiceQuestion" }>;
  value: string | undefined;
  onChange: (selectedOptionKey: string) => void;
}

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
}: MultipleChoiceQuestionProps) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="gap-3">
      {question.options.map((option) => (
        <Label
          key={option.key}
          htmlFor={option.key}
          className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
            value === option.key
              ? "border-violet-500 bg-violet-500/10"
              : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
          }`}
        >
          <RadioGroupItem value={option.key} id={option.key} />
          <span className="text-sm text-zinc-200">{option.text}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}
