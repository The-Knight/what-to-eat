import { Plus, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useId } from 'react';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

interface SortableStepProps {
  id: string;
  step: string;
  index: number;
  update: (index: number, val: string) => void;
  remove: (index: number) => void;
}

function SortableStep({ id, step, index, update, remove }: SortableStepProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 items-start ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1 mt-2">
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 cursor-grab active:cursor-grabbing text-brown-light/40 hover:text-primary transition-colors touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
      </div>
      <textarea
        value={step}
        onChange={(e) => update(index, e.target.value)}
        placeholder={`步骤 ${index + 1}`}
        rows={2}
        className="flex-1 px-3 py-2 bg-white border border-primary/15 rounded-lg text-sm text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      <button
        onClick={() => remove(index)}
        className="p-2 mt-1 text-brown-light hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function StepEditor({ value, onChange }: Props) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const add = () => onChange([...value, '']);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const update = (index: number, val: string) => {
    const updated = [...value];
    updated[index] = val;
    onChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((_, i) => `step-${i}` === active.id);
      const newIndex = value.findIndex((_, i) => `step-${i}` === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const items = value.map((_, i) => `step-${i}`);

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {value.map((step, index) => (
            <SortableStep
              key={`step-${index}`}
              id={`step-${index}`}
              step={step}
              index={index}
              update={update}
              remove={remove}
            />
          ))}
        </SortableContext>
      </DndContext>
      <button
        onClick={add}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark transition-colors"
      >
        <Plus className="w-4 h-4" />
        添加步骤
      </button>
    </div>
  );
}
