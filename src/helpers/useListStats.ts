import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useListStats(listId: string) {
    return useLiveQuery(async () => {
        // Get all items for this list
        const items = await db.listItems
        .where('listId').equals(listId)
        .filter(item => !item.isDeleted) // Exclude deleted items
        .toArray();
        if (!items) return { total: 0, completed: 0 };

        // Calculate locally
        const total = items.length;
        const completed = items.filter(i => i.isChecked).length;

        return { total, completed };
  }, [listId], { total: 0, completed: 0});
}