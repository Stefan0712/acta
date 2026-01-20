import { useLiveQuery } from "dexie-react-hooks";
import type { Group } from "../types/models";
import { db } from "../db";

export interface GroupWithStats extends Group {
  stats: {
    lists: number;
    notes: number;
    polls: number;
  };
}

export const useGroupsWithStats = () => {
  return useLiveQuery(async () => {
    
    // Run all queries in parallel
    const [groups, listGroupIds, noteGroupIds, pollGroupIds] = await Promise.all([
      db.groups.toArray(),
      db.lists.orderBy('groupId').keys(),
      db.notes.orderBy('groupId').keys(),
      db.polls.orderBy('groupId').keys()
    ]);

    // Create the Bucket (The Counter)
    const statsMap: Record<string, { lists: number; notes: number; polls: number }> = {};

    // Helper to safely increment
    const increment = (gId: any, type: 'lists' | 'notes' | 'polls') => {
      // Handle items that might not have a groupId
      if (!gId) return; 
      
      // Initialize if missing
      if (!statsMap[gId]) {
        statsMap[gId] = { lists: 0, notes: 0, polls: 0 };
      }
      statsMap[gId][type]++;
    };

    // Fill the buckets
    listGroupIds.forEach(id => increment(id, 'lists'));
    noteGroupIds.forEach(id => increment(id, 'notes'));
    pollGroupIds.forEach(id => increment(id, 'polls'));

    // Merge
    return groups.map(group => ({
      ...group,
      stats: statsMap[group._id] || { lists: 0, notes: 0, polls: 0 } // Fallback for empty groups
    }));

  }, []); 
};