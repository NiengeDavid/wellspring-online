"use client";

import { useState } from "react";
import type { SafeQuestion } from "@/lib/quiz-types";

interface MatchingQuestionProps {
  question: Extract<SafeQuestion, { type: "matchingQuestion" }>;
  value: { leftKey: string; chosenRightKey: string }[] | undefined;
  onChange: (pairs: { leftKey: string; chosenRightKey: string }[]) => void;
}

const PAIR_LABELS = "ABCDEFGH";

export function MatchingQuestion({
  question,
  value,
  onChange,
}: MatchingQuestionProps) {
  const pairs = value ?? [];
  const [selectedLeftKey, setSelectedLeftKey] = useState<string | null>(null);

  const labelForLeft = (leftKey: string) => {
    const index = pairs.findIndex((p) => p.leftKey === leftKey);
    return index === -1 ? null : PAIR_LABELS[index % PAIR_LABELS.length];
  };
  const labelForRight = (rightKey: string) => {
    const index = pairs.findIndex((p) => p.chosenRightKey === rightKey);
    return index === -1 ? null : PAIR_LABELS[index % PAIR_LABELS.length];
  };

  const handleLeftClick = (leftKey: string) => {
    const alreadyMatched = pairs.some((p) => p.leftKey === leftKey);
    if (alreadyMatched) {
      onChange(pairs.filter((p) => p.leftKey !== leftKey));
      if (selectedLeftKey === leftKey) setSelectedLeftKey(null);
      return;
    }
    setSelectedLeftKey(selectedLeftKey === leftKey ? null : leftKey);
  };

  const handleRightClick = (rightKey: string) => {
    if (selectedLeftKey) {
      const next = pairs
        .filter(
          (p) => p.leftKey !== selectedLeftKey && p.chosenRightKey !== rightKey,
        )
        .concat({ leftKey: selectedLeftKey, chosenRightKey: rightKey });
      onChange(next);
      setSelectedLeftKey(null);
      return;
    }
    const matched = pairs.some((p) => p.chosenRightKey === rightKey);
    if (matched) {
      onChange(pairs.filter((p) => p.chosenRightKey !== rightKey));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-zinc-500">
        Tap an item on the left, then tap its match on the right
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          {question.leftItems.map((item) => {
            const label = labelForLeft(item.key);
            const isSelected = selectedLeftKey === item.key;
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => handleLeftClick(item.key)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-violet-500 ring-2 ring-violet-500/40 bg-violet-500/10"
                    : label
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                {label && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-medium text-emerald-300">
                    {label}
                  </span>
                )}
                <span className="text-zinc-200">{item.text}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {question.rightItems.map((item) => {
            const label = labelForRight(item.key);
            return (
              <button
                type="button"
                key={item.key}
                onClick={() => handleRightClick(item.key)}
                className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                  label
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                }`}
              >
                {label && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-medium text-emerald-300">
                    {label}
                  </span>
                )}
                <span className="text-zinc-200">{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
