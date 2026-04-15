import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { eachDayOfInterval, format, getISOWeek, isSameMonth } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

import { sv } from 'date-fns/locale';

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const firstDayOffset = start.getDay();
  const totalDays = firstDayOffset + end.getDate();
  const weeksCount = Math.ceil(totalDays / 7);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Determine weeks
  const weeks = Array.from({ length: weeksCount }).map((_, weekIndex) => {
    return Array.from({ length: 7 }).map((_, dayIndex) => {
      const dayOffset = weekIndex * 7 + dayIndex - firstDayOffset;
      if (dayOffset >= 0 && dayOffset < end.getDate()) {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOffset + 1);
      }
      return null;
    });
  });

  const clearAllDays = async () => {
    const confirmClear = window.confirm("Är du säker på att du vill rensa alla planerade måltider?");
    if (confirmClear) {
      // "Rensa alla dagar"
      await db.plannedDays.clear();
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="icon-btn"><ChevronLeft /></button>
        <h2 style={{ textTransform: 'capitalize' }}>{format(currentDate, 'MMMM yyyy', { locale: sv })}</h2>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button onClick={nextMonth} className="icon-btn"><ChevronRight /></button>
          <button onClick={clearAllDays} className="icon-btn danger-btn" title="Rensa alla dagar">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'].map((day, i) => (
          <div key={day} className={clsx("day-name", { "weekend-text": i === 0 || i === 6 })}>{day}</div>
        ))}
        <div className="day-name week-col">V</div>
        
        {/* Weeks logic */}
        {weeks.map((week, wIndex) => {
          // get the first valid date in the week for the week number
          const validDate = week.find(d => d !== null);
          const weekNumber = validDate ? getISOWeek(validDate) : '';

          return (
            <React.Fragment key={wIndex}>
              {week.map((date, dIndex) => (
                date ? (
                  <CalendarDay key={date.toISOString()} date={date} />
                ) : (
                  <div key={`empty-${wIndex}-${dIndex}`} className="calendar-day empty" />
                )
              ))}
              <div className="week-number-cell">
                <span>{weekNumber}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const CalendarDay = ({ date }: { date: Date }) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const plannedDay = useLiveQuery(() => db.plannedDays.get(dateStr), [dateStr]);

  const { isOver, setNodeRef } = useDroppable({
    id: dateStr,
    data: { dateStr }
  });

  const handleSave = async () => {
    setIsEditing(false);
    if (!inputValue.trim()) {
      if (plannedDay) await db.plannedDays.delete(dateStr);
      return;
    }
    
    // Check if meal exists
    const existingMeal = await db.meals.where('name').equalsIgnoreCase(inputValue.trim()).first();
    
    if (!existingMeal) {
      const confirmAdd = window.confirm(`"${inputValue.trim()}" is not in your Meal Index. Would you like to add it?`);
      if (confirmAdd) {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
        await db.meals.add({
          id,
          name: inputValue.trim(),
          createdAt: Date.now()
        });
      }
    }
    
    await db.plannedDays.put({
      dateStr,
      mealName: inputValue.trim()
    });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const clearDay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (plannedDay) await db.plannedDays.delete(dateStr);
  };

  return (
    <div 
      ref={setNodeRef} 
      className={clsx('calendar-day', { 
        'drag-over': isOver, 
        'has-meal': !!plannedDay,
        'is-weekend': isWeekend,
        'is-selected': isEditing
      })}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (!isEditing) {
          setInputValue(plannedDay?.mealName || '');
          setIsEditing(true);
        }
      }}
    >
      <span className="date-number">{format(date, 'd')}</span>
      <div className="meal-content">
        {isEditing ? (
          <>
            <input
              type="text"
              className="day-edit-input"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {plannedDay && (
              <button 
                className="clear-day-btn visible" 
                onMouseDown={clearDay}
                title="Rensa dag"
              >
                <Trash2 size={12} />
              </button>
            )}
          </>
        ) : (
          <span className="meal-name">{plannedDay?.mealName}</span>
        )}
      </div>
    </div>
  );
};
