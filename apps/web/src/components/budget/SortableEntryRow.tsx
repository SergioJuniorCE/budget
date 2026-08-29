import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

import { EntryRow } from "./EntryRow";

interface SortableEntryRowProps {
  id: string;
  name: string;
  amount: number;
  note?: string;
  paid?: boolean;
  onEdit: (name: string, amount: number, note?: string) => void;
  onDelete: () => void;
  onTogglePaid?: (paid: boolean) => void;
}

export function SortableEntryRow({
  id,
  name,
  amount,
  note,
  paid,
  onEdit,
  onDelete,
  onTogglePaid,
}: SortableEntryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const dragHandle = (
    <button
      className="flex size-full min-h-9 touch-none cursor-grab items-center justify-center text-muted-foreground/65 transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <GripVerticalIcon className="size-3" />
    </button>
  );

  return (
    <div ref={setNodeRef} style={style}>
      <EntryRow
        name={name}
        amount={amount}
        note={note}
        paid={paid}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePaid={onTogglePaid}
        dragHandle={dragHandle}
      />
    </div>
  );
}
