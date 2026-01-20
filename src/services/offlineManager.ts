import { db, type SyncAction } from '../db';
import { type Table } from 'dexie';
import { ObjectId } from 'bson';

export async function offlineCreate<T>(
  table: Table<T, any>,
  data: Omit<T, 'syncStatus'>,
  actionType: SyncAction['type']
) {
  const tempId = new ObjectId().toHexString();

  // Prepare the object for local UI (Optimistic)
  // Cast as T because we know we are fulfilling the shapeq
  const optimisticData = {
    ...data,
    _id: tempId,
    syncStatus: 'pending_upload'
  } as T;

  // Prepare the Action for the Queue
  const queueItem: SyncAction = {
    type: actionType,
    payload: {...data},
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


export const toggleItemCheck = async (itemId: string, currentStatus: boolean) => {
  const newStatus = !currentStatus;

  // Optimistic update
  await db.listItems.update(itemId, { isChecked: newStatus });

  // Queue Logic
  await db.transaction('rw', db.syncQueue, async () => {
    // Look for a pending toggle for this exact item
    const existingJob = await db.syncQueue
      .where({ type: 'TOGGLE_ITEM' })
      .filter(job => job.payload._id === itemId)
      .first();
    if (existingJob) {
        // Update existing 
        // If user checked and unchecked, just update the payload to the latest state
        await db.syncQueue.update(existingJob.id!, {
          payload: { ...existingJob.payload, isChecked: newStatus }
        });
    } else {
        // Create new job
        const queueItem: SyncAction = {
          type: 'CHECK_ITEM',
          payload: { _id: itemId, isChecked: newStatus },
          tempId: itemId,
          createdAt: Date.now(),
          status: 'pending',
          retryCount: 0
        };
        console.log(queueItem)
      await db.syncQueue.add(queueItem);
    }
  });
};

export const castVote = async (pollId: string, optionId: string, userId: string) => {
  console.log("Casting vote offline", {pollId, optionId, userId});
  
  await db.transaction('rw', db.polls, db.syncQueue, async () => {
    
    // Optimistic Update
    await db.polls.where('_id').equals(pollId).modify(poll => {
      if (!poll.options) return;

      // Map through options to enforce a "Single Choice"
      poll.options = poll.options.map(opt => {
        const votes = opt.votes ?? []; // Handle undefined votes array

        if (opt._id === optionId) {
          // Add user if not already there
          if (!votes.includes(userId)) {
              return { ...opt, votes: [...votes, userId] };
          }
          return opt;
        } 
        
        // Check if user is in this list, if so, remove them
        if (votes.includes(userId)) {
          return { ...opt, votes: votes.filter(id => id !== userId) };
        }

        return opt;
      });
    });

    // Queue Logic
    const existingJob = await db.syncQueue
      .where('type').equals('VOTE_POLL')
      .filter(job => 
        job.status === 'pending' && 
        job.payload.pollId === pollId
      )
      .first();

    if (existingJob) {
      // Update existing sync job
      await db.syncQueue.update(existingJob.id!, {
        payload: { pollId, optionId, userId },
        createdAt: Date.now() 
      });
      
      console.log("Merged vote into existing pending job");
        
    } else {
        //No pending vote exists, create fresh job.
        await db.syncQueue.add({
          type: 'VOTE_POLL',
          payload: { pollId, optionId, userId }, 
          tempId: pollId,
          createdAt: Date.now(),
          status: 'pending',
          retryCount: 0
        });
      }
    });
};