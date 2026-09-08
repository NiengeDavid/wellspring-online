"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDocument, useEditDocument } from "@sanity/sdk-react";
import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { QuestionAccordionItem } from "./QuestionAccordionItem";
import type { AdminQuestion, QuestionsInputProps } from "./types";
import { createQuestion, QUESTION_TYPE_LABELS } from "./types";

function QuestionsInputFallback({ label }: { label: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-zinc-300">{label}</Label>
      <Skeleton className="h-24 w-full bg-zinc-800" />
    </div>
  );
}

function QuestionsInputField({ path, label, ...handle }: QuestionsInputProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const { data: currentQuestions } = useDocument({ ...handle, path });
  const editQuestions = useEditDocument({ ...handle, path });

  const questions = (currentQuestions as AdminQuestion[]) ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex((q) => q._key === active.id);
    const newIndex = questions.findIndex((q) => q._key === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      editQuestions(
        arrayMove(questions, oldIndex, newIndex) as AdminQuestion[],
      );
    }
  };

  const handleAdd = (type: AdminQuestion["_type"]) => {
    const newQuestion = createQuestion(type);
    editQuestions([...questions, newQuestion] as AdminQuestion[]);
    setOpenItems((prev) => [...prev, newQuestion._key]);
  };

  const handleChange = (updated: AdminQuestion) => {
    editQuestions(
      questions.map((q) =>
        q._key === updated._key ? updated : q,
      ) as AdminQuestion[],
    );
  };

  const handleRemove = (key: string) => {
    editQuestions(questions.filter((q) => q._key !== key) as AdminQuestion[]);
  };

  const sortableIds = questions.map((q) => q._key);

  return (
    <div className="space-y-3">
      <Label className="text-zinc-300">{label}</Label>

      {questions.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortableIds}
            strategy={verticalListSortingStrategy}
          >
            <Accordion
              type="multiple"
              value={openItems}
              onValueChange={setOpenItems}
            >
              {questions.map((question) => (
                <QuestionAccordionItem
                  key={question._key}
                  question={question}
                  onChange={handleChange}
                  onRemove={() => handleRemove(question._key)}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm text-zinc-500 py-2">No questions added yet</p>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
          {(Object.keys(QUESTION_TYPE_LABELS) as AdminQuestion["_type"][]).map(
            (type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => handleAdd(type)}
                className="text-zinc-300 focus:bg-zinc-700 focus:text-white"
              >
                {QUESTION_TYPE_LABELS[type]}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function QuestionsInput(props: QuestionsInputProps) {
  return (
    <Suspense fallback={<QuestionsInputFallback label={props.label} />}>
      <QuestionsInputField {...props} />
    </Suspense>
  );
}

export type { QuestionsInputProps } from "./types";
