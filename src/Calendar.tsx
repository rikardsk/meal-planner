import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Trash2, CalendarDays, Copy, Menu, Beef, Fish, Drumstick, Leaf, HelpCircle } from 'lucide-react';
import { 
  format, 
  getISOWeek, 
  isSameDay, 
  addDays, 
  subDays,
  startOfISOWeek
} from 'date-fns';

import { sv } from 'date-fns/locale';

interface CalendarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  
  const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const firstDayOffset = start.getDay() === 0 ? 6 : start.getDay() - 1;
  const totalDays = firstDayOffset + end.getDate();
  const weeksCount = Math.ceil(totalDays / 7);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

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

  const focusDate = (targetDate: Date) => {
    const targetStr = format(targetDate, 'yyyy-MM-dd');
    const el = document.querySelector(`[data-date="${targetStr}"]`) as HTMLElement;
    
    if (el) {
      el.focus();
    } else {
      // Month boundaries - try to switch month
      setCurrentDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
      setPendingFocus(targetStr);
    }
  };

  useEffect(() => {
    if (pendingFocus) {
      const el = document.querySelector(`[data-date="${pendingFocus}"]`) as HTMLElement;
      if (el) {
        el.focus();
        setPendingFocus(null);
      }
    }
  }, [weeks, pendingFocus]);

  const clearMonth = async () => {
    const monthStr = format(currentDate, 'yyyy-MM');
    const confirmClear = window.confirm(`Är du säker på att du vill rensa alla planerade måltider för enbart ${format(currentDate, 'MMMM', {locale: sv})}?`);
    if (confirmClear) {
      const keysToDelete = await db.plannedDays
        .where('dateStr')
        .startsWith(monthStr)
        .primaryKeys();
      await db.plannedDays.bulkDelete(keysToDelete);
    }
  };

  const copyPreviousWeek = async () => {
    const currentWeekStart = startOfISOWeek(currentDate);
    const prevWeekStart = subDays(currentWeekStart, 7);

    if (window.confirm("Vill du kopiera förra veckans matsedel till denna vecka? Detta kommer skriva över befintliga planer.")) {
      for (let i = 0; i < 7; i++) {
        const fromDateStr = format(addDays(prevWeekStart, i), 'yyyy-MM-dd');
        const toDateStr = format(addDays(currentWeekStart, i), 'yyyy-MM-dd');
        
        const sourceDay = await db.plannedDays.get(fromDateStr);
        if (sourceDay) {
          await db.plannedDays.put({
            dateStr: toDateStr,
            mealName: sourceDay.mealName,
            mealId: sourceDay.mealId
          });
        } else {
          await db.plannedDays.delete(toDateStr);
        }
      }
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onToggleSidebar} 
            className="icon-btn" 
            title="Meny"
            style={{ color: 'var(--text)', marginRight: '0.5rem' }}
          >
            <Menu size={24} />
          </button>
          <button onClick={goToToday} className="icon-btn" title="Gå till idag"><CalendarDays /></button>
          <h2 style={{ textTransform: 'capitalize' }}>{format(currentDate, 'MMMM yyyy', { locale: sv })}</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button onClick={copyPreviousWeek} className="icon-btn" title="Kopiera föreg. vecka"><Copy size={18} /></button>
          <button onClick={prevMonth} className="icon-btn"><ChevronLeft /></button>
          <button onClick={nextMonth} className="icon-btn"><ChevronRight /></button>
          <button onClick={clearMonth} className="icon-btn danger-btn" title="Rensa månad">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="calendar-grid">
        {['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'].map((day, i) => (
          <div key={day} className={clsx("day-name", { "weekend-text": i === 5 || i === 6 })}>{day}</div>
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
                  <CalendarDay key={date.toISOString()} date={date} onFocusDate={focusDate} />
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

interface CalendarDayProps {
  date: Date;
  onFocusDate: (date: Date) => void;
}

const CalendarDay = ({ date, onFocusDate }: CalendarDayProps) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const plannedDay = useLiveQuery(() => db.plannedDays.get(dateStr), [dateStr]);
  const meal = useLiveQuery(
    async () => {
      if (!plannedDay?.mealId) return null;
      return db.meals.get(plannedDay.mealId);
    },
    [plannedDay?.mealId]
  );

  const getCategoryIcon = (category?: string) => {
    if (!plannedDay) return null;
    switch (category?.toLowerCase()) {
      case 'kött': return <Beef size={14} />;
      case 'fisk': return <Fish size={14} />;
      case 'kyckling': return <Drumstick size={14} />;
      case 'vego': return <Leaf size={14} />;
      default: return <HelpCircle size={14} />;
    }
  };

  const isToday = isSameDay(date, new Date());

  const { isOver, setNodeRef } = useDroppable({
    id: dateStr,
    data: { dateStr }
  });

  const handleSave = async () => {
    setIsEditing(false);
    const trimmedVal = inputValue.trim();
    
    if (!trimmedVal) {
      if (plannedDay) await db.plannedDays.delete(dateStr);
      return;
    }
    
    // Check if meal exists
    const existingMeal = await db.meals.where('name').equalsIgnoreCase(trimmedVal).first();
    let mealId = existingMeal?.id;

    if (!existingMeal) {
      const confirmAdd = window.confirm(`"${trimmedVal}" finns inte i dina maträtter. Vill du lägga till den?`);
      if (confirmAdd) {
        mealId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
        await db.meals.add({
          id: mealId,
          name: trimmedVal,
          category: 'Okänd',
          createdAt: Date.now()
        });
      }
    }
    
    await db.plannedDays.put({
      dateStr,
      mealName: trimmedVal,
      mealId
    });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) return;

    switch (e.key) {
      case 'ArrowLeft':
        onFocusDate(subDays(date, 1));
        e.preventDefault();
        break;
      case 'ArrowRight':
        onFocusDate(addDays(date, 1));
        e.preventDefault();
        break;
      case 'ArrowUp':
        onFocusDate(subDays(date, 7));
        e.preventDefault();
        break;
      case 'ArrowDown':
        onFocusDate(addDays(date, 7));
        e.preventDefault();
        break;
      case 'Enter':
        setInputValue(plannedDay?.mealName || '');
        setIsEditing(true);
        e.preventDefault();
        break;
      case 'Delete':
      case 'Backspace':
        if (plannedDay) db.plannedDays.delete(dateStr);
        break;
      default:
        // Start typing to edit - Clear previous meal first as requested
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setInputValue(''); 
          setIsEditing(true);
        }
        break;
    }
  };

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const clearDay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (plannedDay) await db.plannedDays.delete(dateStr);
  };

  return (
    <div 
      ref={setNodeRef} 
      data-date={dateStr}
      className={clsx('calendar-day', { 
        'drag-over': isOver, 
        'has-meal': !!plannedDay,
        'is-weekend': isWeekend,
        'is-selected': isEditing,
        'is-today': isToday,
        [`cat-${meal?.category?.toLowerCase() || 'okänd'}`]: !!plannedDay
      })}
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        if (!isEditing) {
          (e.currentTarget as HTMLElement).focus();
        }
      }}
      onDoubleClick={() => {
        if (!isEditing) {
          setInputValue(plannedDay?.mealName || '');
          setIsEditing(true);
        }
      }}
    >
      <span className={clsx("date-number", { "today-number": isToday })}>{format(date, 'd')}</span>
      
      {plannedDay && (
        <button 
          className="clear-day-btn" 
          onMouseDown={clearDay}
          title="Rensa dag"
        >
          <Trash2 size={12} />
        </button>
      )}

      <div className="meal-content">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="day-edit-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <span className="meal-name" title={plannedDay?.mealName}>
            <span style={{ marginRight: '4px', opacity: 0.7, verticalAlign: 'middle', display: 'inline-flex' }}>
              {getCategoryIcon(meal?.category)}
            </span>
            {plannedDay?.mealName}
          </span>
        )}
      </div>
    </div>
  );
};
