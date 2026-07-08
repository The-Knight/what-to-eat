import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Ingredient } from '@/utils/api';
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
  value: Ingredient[];
  onChange: (value: Ingredient[]) => void;
}

interface SortableItemProps {
  id: string;
  item: Ingredient;
  index: number;
  update: (index: number, field: keyof Ingredient, val: string) => void;
  remove: (index: number) => void;
}

function SortableItem({ id, item, index, update, remove }: SortableItemProps) {
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
      className={`flex gap-2 items-center ${isDragging ? 'opacity-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing text-brown-light/40 hover:text-primary transition-colors touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <input
        type="text"
        value={item.name}
        onChange={(e) => update(index, 'name', e.target.value)}
        placeholder="食材名称"
        className="flex-1 px-3 py-2 bg-white border border-primary/15 rounded-lg text-sm text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <input
        type="text"
        value={item.amount}
        onChange={(e) => update(index, 'amount', e.target.value)}
        placeholder="用量"
        className="w-32 px-3 py-2 bg-white border border-primary/15 rounded-lg text-sm text-brown placeholder:text-brown-light/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button
        onClick={() => remove(index)}
        className="p-2 text-brown-light hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function IngredientEditor({ value, onChange }: Props) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const add = () => onChange([...value, { name: '', amount: '' }]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));
  const update = (index: number, field: keyof Ingredient, val: string) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((_, i) => `ingredient-${i}` === active.id);
      const newIndex = value.findIndex((_, i) => `ingredient-${i}` === over.id);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  };

  const items = value.map((_, i) => `ingredient-${i}`);

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {value.map((item, index) => (
            <SortableItem
              key={`ingredient-${index}`}
              id={`ingredient-${index}`}
              item={item}
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
        添加食材
      </button>
    </div>
  );
}
