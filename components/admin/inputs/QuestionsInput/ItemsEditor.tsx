"use client";

import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestionItem } from "./types";

interface ItemsEditorProps {
  items: QuestionItem[];
  onChange: (items: QuestionItem[]) => void;
}

export function ItemsEditor({ items, onChange }: ItemsEditorProps) {
  const updateItem = (key: string, text: string) => {
    onChange(items.map((i) => (i._key === key ? { ...i, text } : i)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (key: string) => onChange(items.filter((i) => i._key !== key));

  const add = () =>
    onChange([...items, { _key: crypto.randomUUID(), text: "" }]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        List items in the CORRECT order — students see them shuffled
      </p>
      {items.map((item, index) => (
        <div key={item._key} className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-300">
            {index + 1}
          </span>
          <Input
            value={item.text ?? ""}
            onChange={(e) => updateItem(item._key, e.currentTarget.value)}
            placeholder={`Item ${index + 1}`}
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
              disabled={index === items.length - 1}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(item._key)}
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
        Add item
      </Button>
    </div>
  );
}
