"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ItemsEditor } from "./ItemsEditor";
import { OptionsEditor } from "./OptionsEditor";
import { PairsEditor } from "./PairsEditor";
import { StringListEditor } from "./StringListEditor";
import { type AdminQuestion, QUESTION_TYPE_LABELS } from "./types";

interface QuestionAccordionItemProps {
  question: AdminQuestion;
  onChange: (question: AdminQuestion) => void;
  onRemove: () => void;
}

export function QuestionAccordionItem({
  question,
  onChange,
  onRemove,
}: QuestionAccordionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question._key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 rounded-lg border border-zinc-700 bg-zinc-800/30 ${isDragging ? "opacity-50 shadow-lg z-10" : ""}`}
    >
      <AccordionItem value={question._key} className="border-none">
        <div className="flex items-center gap-1 pr-2">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing touch-none p-3 text-zinc-500 hover:text-zinc-300"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <AccordionTrigger className="flex-1 py-3 pr-0 hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <span className="text-sm text-zinc-200">
                {question.prompt || "Untitled question"}
              </span>
              <span className="text-xs text-zinc-500">
                {QUESTION_TYPE_LABELS[question._type]} • {question.points ?? 0}{" "}
                pts
              </span>
            </div>
          </AccordionTrigger>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            className="shrink-0 text-zinc-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <AccordionContent className="px-3 pb-4">
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor={`${question._key}-prompt`}
                  className="text-xs text-zinc-400"
                >
                  Prompt
                </Label>
                <Textarea
                  id={`${question._key}-prompt`}
                  value={question.prompt ?? ""}
                  onChange={(e) =>
                    onChange({ ...question, prompt: e.currentTarget.value })
                  }
                  rows={2}
                  placeholder="Question prompt"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor={`${question._key}-points`}
                  className="text-xs text-zinc-400"
                >
                  Points
                </Label>
                <Input
                  id={`${question._key}-points`}
                  type="number"
                  min={1}
                  value={question.points ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...question,
                      points: Number(e.currentTarget.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {question._type === "multipleChoiceQuestion" && (
              <OptionsEditor
                options={question.options ?? []}
                mode="single"
                onChange={(options) => onChange({ ...question, options })}
              />
            )}
            {question._type === "selectAllQuestion" && (
              <OptionsEditor
                options={question.options ?? []}
                mode="multiple"
                onChange={(options) => onChange({ ...question, options })}
              />
            )}
            {question._type === "fillInQuestion" && (
              <StringListEditor
                items={question.acceptableAnswers ?? []}
                onChange={(acceptableAnswers) =>
                  onChange({ ...question, acceptableAnswers })
                }
              />
            )}
            {question._type === "orderingQuestion" && (
              <ItemsEditor
                items={question.items ?? []}
                onChange={(items) => onChange({ ...question, items })}
              />
            )}
            {question._type === "matchingQuestion" && (
              <PairsEditor
                pairs={question.pairs ?? []}
                onChange={(pairs) => onChange({ ...question, pairs })}
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}
