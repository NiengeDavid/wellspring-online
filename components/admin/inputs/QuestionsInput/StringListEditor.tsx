"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StringListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function StringListEditor({
  items,
  onChange,
  placeholder,
}: StringListEditorProps) {
  const updateItem = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)));
  };

  const remove = (index: number) =>
    onChange(items.filter((_, i) => i !== index));

  const add = () => onChange([...items, ""]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">
        All answers that should be accepted
      </p>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: list only reorders via remove/add, not drag
        <div key={index} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.currentTarget.value)}
            placeholder={placeholder ?? `Acceptable answer ${index + 1}`}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(index)}
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
        Add answer
      </Button>
    </div>
  );
}
