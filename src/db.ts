import Dexie, { Table } from 'dexie';

export interface Meal {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  createdAt: number;
}

export interface PlannedDay {
  dateStr: string; // YYYY-MM-DD
  mealName: string;
  mealId?: string; // Optional, can be null if entered manually
}

export class MealPlannerDB extends Dexie {
  meals!: Table<Meal>;
  plannedDays!: Table<PlannedDay>;

  constructor() {
    super('MealPlannerDB');
    this.version(2).stores({
      meals: 'id, name, category, *tags, createdAt',
      plannedDays: 'dateStr, mealId'
    });
  }
}

export const db = new MealPlannerDB();
