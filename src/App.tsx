import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { Calendar } from './Calendar';
import { MealIndex, MealCard } from './MealIndex';
import { db } from './db';
import { CalendarDays, List as ListIcon } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'index'>('calendar');
  const [activeDragMeal, setActiveDragMeal] = useState<{id: string, name: string} | null>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragMeal(event.active.data.current as { id: string, name: string });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragMeal(null);
    const { active, over } = event;
    if (over && active.data.current && over.data.current) {
      const dateStr = over.data.current.dateStr;
      const meal = active.data.current as { id: string, name: string };
      
      await db.plannedDays.put({
        dateStr,
        mealId: meal.id,
        mealName: meal.name
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app-container">
        {/* Mobile Navigation */}
        <div className="mobile-nav">
          <button 
            className={`nav-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            <CalendarDays size={20} />
            <span>Calendar</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'index' ? 'active' : ''}`}
            onClick={() => setActiveTab('index')}
          >
            <ListIcon size={20} />
            <span>Meals</span>
          </button>
        </div>

        <main className="main-content">
          <div className={`pane view-calendar ${activeTab === 'calendar' ? 'active-pane' : ''}`}>
            <Calendar />
          </div>
          <div className={`pane view-index ${activeTab === 'index' ? 'active-pane' : ''}`}>
            <MealIndex />
          </div>
        </main>
      </div>
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)'
      }}>
        {activeDragMeal ? <MealCard name={activeDragMeal.name} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
