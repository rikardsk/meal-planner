import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, TouchSensor, MouseSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { Calendar } from './Calendar';
import { MealIndex, MealCard } from './MealIndex';
import { db } from './db';
import { CalendarDays, List as ListIcon, Beef, Fish, Drumstick, Leaf, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'index'>('calendar');
  const [activeDragMeal, setActiveDragMeal] = useState<{id: string, name: string} | null>(null);
  const [isMealIndexOpen, setIsMealIndexOpen] = useState(true);

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

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'kött': return <Beef size={16} />;
      case 'fisk': return <Fish size={16} />;
      case 'kyckling': return <Drumstick size={16} />;
      case 'vego': return <Leaf size={16} />;
      default: return <HelpCircle size={16} />;
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
            <Calendar onToggleSidebar={() => setIsMealIndexOpen(!isMealIndexOpen)} isSidebarOpen={isMealIndexOpen} />
          </div>
          <div className={clsx("pane view-index", { 
            "active-pane": activeTab === 'index',
            "is-closed": !isMealIndexOpen
          })}>
            <MealIndex />
          </div>
        </main>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragMeal ? (
          <div className="meal-drag-ghost">
            <span className="ghost-icon">
              {getCategoryIcon((activeDragMeal as any).category)}
            </span>
            <span className="ghost-name">{activeDragMeal.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
