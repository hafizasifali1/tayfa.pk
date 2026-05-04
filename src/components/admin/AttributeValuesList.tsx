import React, { useRef, useEffect } from 'react';
import { AttributeValue } from '../../types/attribute';
import { Trash2, GripVertical, Plus, Image as ImageIcon, Palette } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  values: Partial<AttributeValue>[];
  displayType: string;
  onChange: (values: Partial<AttributeValue>[]) => void;
}

const SortableValueItem = ({ 
  item, 
  index, 
  displayType, 
  onUpdate, 
  onRemove,
  isLast 
}: { 
  item: Partial<AttributeValue>; 
  index: number;
  displayType: string;
  onUpdate: (idx: number, patch: Partial<AttributeValue>) => void;
  onRemove: (idx: number) => void;
  isLast: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id || `temp-${index}` });

  useEffect(() => {
    // Focus the input if this is a newly added item (has temp id and is empty)
    if (item.id?.startsWith('temp-') && !item.value && isLast) {
      inputRef.current?.focus();
    }
  }, [isLast]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center gap-3 bg-white p-3 rounded-2xl border border-brand-dark/10 group transition-all ${isDragging ? 'shadow-xl border-brand-gold/50 opacity-90' : 'hover:border-brand-gold/30'}`}
    >
      <button {...attributes} {...listeners} className="text-brand-dark/20 hover:text-brand-dark/40 cursor-grab active:cursor-grabbing px-1">
        <GripVertical size={16} />
      </button>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5">
          <input
            ref={inputRef}
            type="text"
            placeholder="Value Name (e.g. Blue)"
            value={item.value || ''}
            onChange={(e) => onUpdate(index, { value: e.target.value })}
            className="w-full px-4 py-2 bg-brand-cream/10 rounded-xl text-xs border border-transparent focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all"
          />
        </div>

        <div className="md:col-span-4">
          {displayType === 'color_swatch' ? (
            <div className="relative">
              <Palette size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/30" />
              <input
                type="text"
                placeholder="#000000"
                value={item.colorCode || ''}
                onChange={(e) => onUpdate(index, { colorCode: e.target.value })}
                className="w-full pl-8 pr-8 py-2 bg-brand-cream/10 rounded-xl text-[10px] border border-transparent focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all font-mono"
              />
              <div 
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: item.colorCode || '#f0f0f0' }}
              />
            </div>
          ) : (
            <div className="relative">
              <ImageIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/30" />
              <input
                type="text"
                placeholder="Image URL (Optional)"
                value={item.imageUrl || ''}
                onChange={(e) => onUpdate(index, { imageUrl: e.target.value })}
                className="w-full pl-8 pr-4 py-2 bg-brand-cream/10 rounded-xl text-[10px] border border-transparent focus:bg-white focus:border-brand-gold/30 focus:outline-none transition-all font-mono"
              />
            </div>
          )}
        </div>

        <div className="md:col-span-3 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer group/toggle select-none">
            <div className={`w-10 h-5 rounded-full relative transition-colors ${item.isActive ? 'bg-green-500' : 'bg-brand-dark/20'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.isActive ? 'left-6' : 'left-1'}`} />
            </div>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={item.isActive} 
              onChange={(e) => onUpdate(index, { isActive: e.target.checked })}
            />
            <span className="text-[9px] font-bold text-brand-dark/40 group-hover/toggle:text-brand-dark transition-colors uppercase tracking-tighter">
              {item.isActive ? 'Active' : 'Hidden'}
            </span>
          </label>
          
          <button 
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 text-brand-dark/20 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const AttributeValuesList: React.FC<Props> = ({ values, displayType, onChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addValue = () => {
    onChange([...values, { 
      id: `temp-${uuidv4()}`,
      value: '', 
      isActive: true, 
      displayOrder: values.length,
      colorCode: displayType === 'color_swatch' ? '#000000' : undefined
    }]);
  };

  const updateValue = (index: number, patch: Partial<AttributeValue>) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], ...patch };
    onChange(newValues);
  };

  const removeValue = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = values.findIndex(v => (v.id || `temp-${values.indexOf(v)}`) === active.id);
      const newIndex = values.findIndex(v => (v.id || `temp-${values.indexOf(v)}`) === over.id);
      const reordered = arrayMove(values, oldIndex, newIndex).map((v, idx) => ({ ...v, displayOrder: idx }));
      onChange(reordered);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Attribute Values</h4>
          <p className="text-[9px] text-brand-dark/40 mt-1 font-medium">Define the available choices for this attribute.</p>
        </div>
        <button 
          type="button"
          onClick={addValue}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-dark/10"
        >
          <Plus size={14} />
          Add Value
        </button>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-[300px]">
        {values.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-brand-cream/5 rounded-[2.5rem] border-2 border-dashed border-brand-dark/5">
            <div className="w-16 h-16 bg-brand-cream/20 rounded-full flex items-center justify-center mb-4">
              <Palette className="text-brand-dark/10" size={32} />
            </div>
            <p className="text-xs text-brand-dark/30 font-bold uppercase tracking-widest">No values defined yet</p>
            <p className="text-[10px] text-brand-dark/20 mt-1">Click "Add Value" to start building your options.</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={values.map((v, i) => v.id || `temp-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {values.map((item, idx) => (
                  <SortableValueItem
                    key={item.id || `temp-${idx}`}
                    item={item}
                    index={idx}
                    displayType={displayType}
                    onUpdate={updateValue}
                    onRemove={removeValue}
                    isLast={idx === values.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Live Preview Section */}
      {values.length > 0 && (
        <div className="mt-8 p-6 bg-brand-dark rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-colors" />
          <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-5 relative z-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
            Storefront Preview
          </h5>
          <div className="flex flex-wrap gap-4 relative z-10">
            {values.filter(v => v.isActive && v.value).map((v, idx) => {
              if (displayType === 'color_swatch') {
                return (
                  <div key={idx} className="group/swatch relative">
                    <div 
                      className="w-11 h-11 rounded-full border-2 border-white/20 ring-1 ring-white/10 shadow-lg cursor-pointer hover:scale-110 hover:border-white transition-all duration-300"
                      style={{ backgroundColor: v.colorCode || '#ccc' }}
                    />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-brand-dark text-[8px] font-bold uppercase rounded-md shadow-xl opacity-0 group-hover/swatch:opacity-100 transition-all pointer-events-none scale-90 group-hover/swatch:scale-100">
                      {v.value}
                    </div>
                  </div>
                );
              }
              if (displayType === 'dropdown') {
                return null;
              }
              return (
                <div key={idx} className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-[10px] font-bold text-white hover:bg-white hover:text-brand-dark hover:scale-105 cursor-pointer transition-all duration-300 uppercase tracking-widest">
                  {v.value}
                </div>
              );
            })}
            {displayType === 'dropdown' && (
              <div className="w-full">
                <select className="w-full px-5 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-xs font-bold text-white focus:outline-none focus:bg-white focus:text-brand-dark transition-all appearance-none cursor-pointer">
                  <option className="text-brand-dark">Select {displayType}...</option>
                  {values.filter(v => v.isActive && v.value).map((v, idx) => (
                    <option key={idx} className="text-brand-dark">{v.value}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
