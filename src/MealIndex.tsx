import React, { useState, useMemo } from 'react';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, GripVertical, Edit2, Trash2, X, Trophy } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

const CATEGORIES = ['Kött', 'Fisk', 'Kyckling', 'Vego', 'Okänd'];
const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export const MealIndex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newMealName, setNewMealName] = useState('');
  const [newMealCategory, setNewMealCategory] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeWeekday, setActiveWeekday] = useState<number | null>(null);
  const [isRankingActive, setIsRankingActive] = useState(false);

  const meals = useLiveQuery(() => db.meals.toArray(), []);
  const plannedDays = useLiveQuery(() => db.plannedDays.toArray(), []);

  // Calculate counts and weekday patterns
  const { mealCounts, weekdayPreferences } = useMemo(() => {
    const counts: Record<string, number> = {};
    const patterns: Record<string, Set<number>> = {}; // mealId -> Set of days [0-6]

    plannedDays?.forEach(day => {
      const key = day.mealId || day.mealName;
      counts[key] = (counts[key] || 0) + 1;
      
      const dayOfWeek = new Date(day.dateStr).getDay();
      if (!patterns[key]) patterns[key] = new Set();
      patterns[key].add(dayOfWeek);
    });
    return { mealCounts: counts, weekdayPreferences: patterns };
  }, [plannedDays]);
  const filteredMeals = useMemo(() => {
    if (!meals) return [];
    const filtered = meals.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !activeCategory || m.category === activeCategory;
      
      let matchesWeekday = true;
      if (activeWeekday !== null) {
        // Map current WEEKDAYS index [0=Mån, ..., 6=Sön] to getDay() [0=Sun, 1=Mon, ..., 6=Sat]
        const targetDay = [1, 2, 3, 4, 5, 6, 0][activeWeekday];
        matchesWeekday = !!(weekdayPreferences[m.id]?.has(targetDay) || weekdayPreferences[m.name]?.has(targetDay));
      }
      
      return matchesSearch && matchesCategory && matchesWeekday;
    });

    if (isRankingActive) {
      return [...filtered].sort((a, b) => (mealCounts[b.id] || 0) - (mealCounts[a.id] || 0));
    } else {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'sv', { sensitivity: 'base' }));
    }
  }, [meals, searchTerm, activeCategory, activeWeekday, weekdayPreferences, isRankingActive, mealCounts]);

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newMealName.trim();
    if (!trimmedName) return;
    
    // Check for duplicates (case-insensitive)
    const existing = await db.meals.where('name').equalsIgnoreCase(trimmedName).first();
    if (existing) {
      alert("Denna maträtt finns redan i din lista!");
      setNewMealName('');
      return;
    }

    await db.meals.add({
      id: crypto.randomUUID(),
      name: trimmedName,
      category: newMealCategory || 'Okänd',
      createdAt: Date.now()
    });
    setNewMealName('');
    setNewMealCategory('');
  };

  const clearAllMeals = async () => {
    if (window.confirm("Är du säker på att du vill ta bort ALLA maträtter från listan? Detta kan inte ångras.")) {
      await db.meals.clear();
    }
  };

  return (
    <div className="meal-index">
      <div className="meal-index-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Maträtter</h2>
          <button onClick={clearAllMeals} className="text-btn danger-btn" style={{ fontSize: '0.75rem' }}>Rensa alla</button>
        </div>
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Sök maträtt..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button 
            className={clsx("icon-btn-sm", { active: isRankingActive })}
            onClick={() => setIsRankingActive(!isRankingActive)}
            title="Topplista (sortera efter antal)"
            type="button"
            style={{ color: isRankingActive ? 'var(--primary)' : 'inherit' }}
          >
            <Trophy size={18} />
          </button>
          {searchTerm && <button className="icon-btn-sm" onClick={() => setSearchTerm('')}><X size={14} /></button>}
        </div>
      </div>

      <div className="filter-bar">
        <button 
          className={clsx("filter-chip", { active: activeCategory === null && activeWeekday === null })}
          onClick={() => { setActiveCategory(null); setActiveWeekday(null); }}
        >
          Alla
        </button>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            className={clsx("filter-chip", { active: activeCategory === cat })}
            onClick={() => { setActiveCategory(cat === activeCategory ? null : cat); setActiveWeekday(null); }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="filter-bar">
        {WEEKDAYS.map((day, idx) => (
          <button 
            key={day}
            className={clsx("filter-chip", { active: activeWeekday === idx })}
            onClick={() => { setActiveWeekday(idx === activeWeekday ? null : idx); setActiveCategory(null); }}
          >
            {day}
          </button>
        ))}
      </div>

      <form onSubmit={addMeal} className="add-meal-form">
        <div style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Ny maträtt..."
            value={newMealName}
            onChange={e => setNewMealName(e.target.value)}
            style={{ flex: 1, minWidth: 0 }}
          />
          <select 
            className="category-select"
            value={newMealCategory} 
            onChange={e => setNewMealCategory(e.target.value)}
            style={{ flex: '0 0 110px' }}
          >
            <option value="">Kategori...</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <button type="submit" className="add-btn"><Plus size={18} /></button>
      </form>

      <div className="meal-list">
        {filteredMeals.map(meal => (
          <DraggableMeal
            key={meal.id}
            meal={meal}
            count={mealCounts[meal.id] || mealCounts[meal.name] || 0}
          />
        ))}
        {filteredMeals.length === 0 && <p className="empty-state">Inga maträtter hittades.</p>}
      </div>
    </div>
  );
};

interface MealCardProps {
  id: string;
  name: string;
  category?: string;
  count: number;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export const MealCard = ({ id, name, category, count, isDragging, dragHandleProps }: MealCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [editCategory, setEditCategory] = useState(category || '');

  const handleUpdate = async (newName?: string, newCategory?: string) => {
    const finalName = (newName !== undefined ? newName : editValue).trim();
    const finalCategory = newCategory !== undefined ? newCategory : editCategory;
    
    if (finalName) {
      await db.meals.update(id, { 
        name: finalName,
        category: finalCategory || 'Okänd'
      });
      
      // Update corresponding meal names in the calendar
      await db.plannedDays
        .where('mealId')
        .equals(id)
        .modify({ mealName: finalName });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Vill du ta bort "${name}" permanent?`)) {
      await db.meals.delete(id);
      await db.plannedDays.where('mealId').equals(id).delete();
    }
  };

  return (
    <div className={clsx("meal-item", { "is-dragging": isDragging })}>
      <div className="drag-handle" {...dragHandleProps} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
        <GripVertical size={16} />
      </div>

      {isEditing ? (
        <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
          <input
            autoFocus
            className="meal-edit-inline"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUpdate()}
            style={{ flex: 1, minWidth: 0 }}
          />
          <select
            className="category-select"
            value={editCategory}
            onChange={e => {
              const val = e.target.value;
              setEditCategory(val);
              handleUpdate(editValue, val);
            }}
            style={{ padding: '2px 4px', fontSize: '0.75rem', flex: '0 0 110px' }}
          >
            <option value="">Kategori...</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          {category && (
            <span className={`category-badge category-${category.toLowerCase()}`}>
              {category}
            </span>
          )}
          <span className="meal-card-name" style={{ flex: 1 }} title={name}>{name}</span>
        </div>
      )}

      {!isEditing && (
        <div className="meal-item-actions">
          {count > 0 && <span className="meal-count-badge" title="Antal gånger använd">{count}</span>}
          <button className="icon-btn-sm" onClick={() => setIsEditing(true)}><Edit2 size={12} /></button>
          <button className="icon-btn-sm danger-btn" onClick={handleDelete}><Trash2 size={12} /></button>
        </div>
      )}
    </div>
  );
};

const DraggableMeal = ({ meal, count }: { meal: any, count: number }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `meal-${meal.id}`,
    data: { name: meal.name, id: meal.id }
  });

  return (
    <div ref={setNodeRef} style={{ opacity: isDragging ? 0.4 : 1 }}>
      <MealCard 
        id={meal.id} 
        name={meal.name} 
        category={meal.category} 
        count={count} 
        isDragging={isDragging} 
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
};
