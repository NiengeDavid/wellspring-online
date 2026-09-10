"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useMemo } from "react";
import type { SafeQuestion } from "@/lib/quiz-types";

interface OrderingQuestionProps {
  question: Extract<SafeQuestion, { type: "orderingQuestion" }>;
  value: string[] | undefined;
  onChange: (orderedItemKeys: string[]) => void;
}

function SortableRow({
  itemKey,
  text,
  index,
}: {
  itemKey: string;
  text: string;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 ${
        isDragging ? "opacity-50 shadow-lg z-10" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing touch-none text-zinc-500 hover:text-zinc-300"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-300">
        {index + 1}
      </span>
      <span className="text-sm text-zinc-200">{text}</span>
    </div>
  );
}

export function OrderingQuestion({
  question,
  value,
  onChange,
}: OrderingQuestionProps) {
  const defaultOrder = useMemo(
    () => question.items.map((i) => i.key),
    [question.items],
  );
  const order = value ?? defaultOrder;

  const textByKey = useMemo(
    () => new Map(question.items.map((i) => [i.key, i.text])),
    [question.items],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    onChange(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-zinc-500">Drag items into the correct order</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {order.map((key, index) => (
              <SortableRow
                key={key}
                itemKey={key}
                text={textByKey.get(key) ?? ""}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
