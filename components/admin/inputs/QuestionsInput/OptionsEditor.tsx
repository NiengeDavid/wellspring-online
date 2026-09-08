"use client";

import { Check, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestionOption } from "./types";

interface OptionsEditorProps {
  options: QuestionOption[];
  mode: "single" | "multiple";
  onChange: (options: QuestionOption[]) => void;
}

export function OptionsEditor({ options, mode, onChange }: OptionsEditorProps) {
  const updateOption = (key: string, patch: Partial<QuestionOption>) => {
    onChange(options.map((o) => (o._key === key ? { ...o, ...patch } : o)));
  };

  const setCorrect = (key: string) => {
    if (mode === "single") {
      onChange(options.map((o) => ({ ...o, isCorrect: o._key === key })));
    } else {
      updateOption(key, {
        isCorrect: !options.find((o) => o._key === key)?.isCorrect,
      });
    }
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= options.length) return;
    const next = [...options];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (key: string) =>
    onChange(options.filter((o) => o._key !== key));

  const add = () =>
    onChange([
      ...options,
      { _key: crypto.randomUUID(), text: "", isCorrect: false },
    ]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        {mode === "single"
          ? "Mark the one correct option"
          : "Mark all correct options"}
      </p>
      {options.map((option, index) => (
        <div key={option._key} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCorrect(option._key)}
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded${mode === "single" ? "-full" : ""} border transition-colors ${
              option.isCorrect
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-600 text-transparent hover:border-zinc-400"
            }`}
            title="Mark correct"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <Input
            value={option.text ?? ""}
            onChange={(e) =>
              updateOption(option._key, { text: e.currentTarget.value })
            }
            placeholder={`Option ${index + 1}`}
            className="flex-1"
          />
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => move(index, -1)}
              disabled={index === 0}
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => move(index, 1)}
              disabled={index === options.length - 1}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(option._key)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Add option
      </Button>
    </div>
  );
}
