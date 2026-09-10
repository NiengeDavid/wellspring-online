"use client";

import { ArrowRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QuestionPair } from "./types";

interface PairsEditorProps {
  pairs: QuestionPair[];
  onChange: (pairs: QuestionPair[]) => void;
}

export function PairsEditor({ pairs, onChange }: PairsEditorProps) {
  const updatePair = (key: string, patch: Partial<QuestionPair>) => {
    onChange(pairs.map((p) => (p._key === key ? { ...p, ...patch } : p)));
  };

  const remove = (key: string) => onChange(pairs.filter((p) => p._key !== key));

  const add = () =>
    onChange([...pairs, { _key: crypto.randomUUID(), left: "", right: "" }]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">Each row is a correct pair</p>
      {pairs.map((pair) => (
        <div key={pair._key} className="flex items-center gap-2">
          <Input
            value={pair.left ?? ""}
            onChange={(e) =>
              updatePair(pair._key, { left: e.currentTarget.value })
            }
            placeholder="Left"
            className="flex-1"
          />
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
          <Input
            value={pair.right ?? ""}
            onChange={(e) =>
              updatePair(pair._key, { right: e.currentTarget.value })
            }
            placeholder="Right"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(pair._key)}
            className="shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
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
        Add pair
      </Button>
    </div>
  );
}
