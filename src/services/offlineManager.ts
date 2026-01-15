import { db, type SyncAction } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { type Table } from 'dexie';

export async function offlineCreate<T>(
  table: Table<T, any>,
  data: Omit<T, '_id' | 'syncStatus'>,
  actionType: SyncAction['type']
) {
  // Generate a temporary id (UUID)
  const tempId = uuidv4();

  // Prepare the object for local UI (Optimistic)
  // Cast as T because we know we are fulfilling the shape
  const optimisticData = {
    ...data,
    _id: tempId,                  // Use ONLY _id
    syncStatus: 'pending_upload'  // Flag for UI
  } as T;

  // Prepare the Action for the Queue
  const queueItem: SyncAction = {
    type: actionType,
    payload: data,
    tempId: tempId,      //Keep the UUID separate here to find the item later
    createdAt: Date.now(),
    status: 'pending',
    retryCount: 0
  };
  // Save to DB and Queue simultaneously
  await db.transaction('rw', table, db.syncQueue, async () => {
    await table.add(optimisticData);
    await db.syncQueue.add(queueItem);
  });

  return optimisticData;
}