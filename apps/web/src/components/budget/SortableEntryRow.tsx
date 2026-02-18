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
      className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing touch-none shrink-0 flex items-center"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <GripVerticalIcon className="h-3 w-3 text-muted-foreground" />
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
