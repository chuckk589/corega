import { defineStore } from 'pinia';

export const useAgGridStore = defineStore({
  id: 'aggrid',
  state: () => ({
    lottery: JSON.parse(localStorage.getItem('lottery') || '[]'),
  }),

  actions: {
    saveTableState(tableName: string, state: any) {
      localStorage.setItem(tableName, JSON.stringify(state));
    },
    loadTableState(tableName: string) {
      return JSON.parse(localStorage.getItem(tableName) || '[]');
    },
  },
});
