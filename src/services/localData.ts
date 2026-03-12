import { get, set, del } from 'idb-keyval';
import { Group, Expense } from '../types';

const STORAGE_KEYS = {
  GROUPS: 'simple_split_groups_idb',
  EXPENSES: 'simple_split_expenses_idb'
};

export const localData = {
  getGroups: async (): Promise<Group[]> => {
    const data = await get(STORAGE_KEYS.GROUPS);
    return data || [];
  },

  saveGroups: async (groups: Group[]) => {
    await set(STORAGE_KEYS.GROUPS, groups);
  },

  getExpenses: async (groupId: string): Promise<Expense[]> => {
    const data = await get(`${STORAGE_KEYS.EXPENSES}_${groupId}`);
    return data || [];
  },

  saveExpenses: async (groupId: string, expenses: Expense[]) => {
    await set(`${STORAGE_KEYS.EXPENSES}_${groupId}`, expenses);
  },

  deleteGroup: async (groupId: string) => {
    const groups = await localData.getGroups();
    const updatedGroups = groups.filter(g => g.id !== groupId);
    await localData.saveGroups(updatedGroups);
    await del(`${STORAGE_KEYS.EXPENSES}_${groupId}`);
  }
};
