import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

export const MealIndex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newMealName, setNewMealName] = useState('');
  const meals = useLiveQuery(
    () => db.meals.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).toArray(),
    [searchTerm]
  );

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;
    await db.meals.add({
      id: uuidv4(),
      name: newMealName.trim(),
      createdAt: Date.now()
    });
    setNewMealName('');
  };

  return (
    <div className="meal-index">
      <div className="meal-index-header">
        <h2>Meals</h2>
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search meals..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <form onSubmit={addMeal} className="add-meal-form">
        <input 
          type="text" 
          placeholder="New meal name..."
          value={newMealName}
          onChange={e => setNewMealName(e.target.value)}
        />
        <button type="submit" className="add-btn"><Plus size={18} /></button>
      </form>

      <div className="meal-list">
        {meals?.map(meal => (
          <DraggableMeal key={meal.id} id={meal.id} name={meal.name} />
        ))}
        {meals?.length === 0 && <p className="empty-state">No meals found.</p>}
      </div>
    </div>
  );
};

export const MealCard = ({ name, isDragging }: { name: string, isDragging?: boolean }) => {
  return (
    <div className={clsx("meal-item", { "is-dragging": isDragging })}>
      <GripVertical size={16} className="drag-handle" />
      <span>{name}</span>
    </div>
  );
};

const DraggableMeal = ({ id, name }: { id: string, name: string }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `meal-${id}`,
    data: { name, id }
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <MealCard name={name} isDragging={isDragging} />
    </div>
  );
};
