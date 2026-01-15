import { db, type SyncAction } from "../db";
import API from "./apiService";

export async function processSyncQueue() {
    // Check if we are online
    if (!navigator.onLine) return;
    console.log("You are online")

    // Get all pending actions, ordered by creation time
    const queue = await db.syncQueue
        .where('status').equals('pending')
        .sortBy('createdAt');

    if (queue.length === 0) return;
    console.log(`Processing ${queue.length} offline actions...`);

    // Process one by one
    for (const action of queue) {
        try {
            await processAction(action);
        } catch (error) {
            console.error(`Action ${action.id} failed:`, error);
        }
    }
}

// Decides what API call to make
async function processAction(action: SyncAction) {
    switch (action.type) {
        case 'CREATE_LIST':
            await handleCreateList(action);
            break;
        case 'CREATE_ITEM':
            await handleCreateItem(action);
            break;
        case 'CHECK_ITEM':
            await handleCheckItem(action);
            break;
        case 'CREATE_POLL':
            await handleCreatePoll(action);
            break;
        case 'VOTE_POLL':
            await handleVotePoll(action);
            break;
        case 'CREATE_NOTE':
            await handleCreateNote(action);
            break;
        case 'CREATE_COMMENT':
            await handleCreateNoteComment(action);
            break;
        }
}

// Create the list and swap the local id with the real one
async function handleCreateList(action: SyncAction) {
    const localId = action.tempId!; // The UUID generated locally
    const payload = action.payload; // The data


    // Send to Server
    const { data: serverResponse } = await API.post('/lists', payload);
    const realServerId = serverResponse._id; // The new MongoDB id
    console.log(`List created! API responded with the id ${realServerId}`);

    // Swap the temporary id with the new permanent one
    await db.transaction('rw', db.lists, db.listItems, db.syncQueue, async () => {
        
        // Update the List itself
        const list = await db.lists.get(localId);
        if (list) {
            // Delete old entry, add new one
            await db.lists.delete(localId);
            await db.lists.add({
                ...list,
                _id: realServerId, // new id
                syncStatus: 'synced'
            });
        }

        // Update any Items belonging to this list
        await db.listItems.where('listId').equals(localId).modify({
            listId: realServerId
        });

        // Mark action as done
        await db.syncQueue.update(action.id!, { status: 'completed' });
    });
}

// Create Item
async function handleCreateItem(action: SyncAction) {
    const localId = action.tempId!;
    const payload = action.payload;

    // Check if the payload still have the old id in listId
    const currentLocalItem = await db.listItems.get(localId);
    if (currentLocalItem) {
        payload.listId = currentLocalItem.listId; // Ensure we send the latest id
    }

    const { data: serverResponse } = await API.post('/items', payload);
    const realServerId = serverResponse._id;
    console.log(`Item created! API responded with the id ${realServerId}`);

    await db.transaction('rw', db.listItems, db.syncQueue, async () => {
        // Swap ids
        const item = await db.listItems.get(localId);
        if (item) {
            await db.listItems.delete(localId);
            await db.listItems.add({
                ...item,
                _id: realServerId,
                syncStatus: 'synced'
            });
        }
        await db.syncQueue.update(action.id!, { status: 'completed' });
    });
}

// Checking items
async function handleCheckItem(action: SyncAction) {
    const { id, isChecked } = action.payload;

    // Simply send the update
    await API.patch(`/items/${id}`, { isChecked });
    console.log(`Item was checked/unchecked`)
    // Mark local item as synced
    await db.transaction('rw', db.listItems, db.syncQueue, async () => {
        await db.listItems.update(id, { syncStatus: 'synced' });
        await db.syncQueue.update(action.id!, { status: 'completed' });
    });
}
// Create pol
async function handleCreatePoll(action: SyncAction) {
    const localId = action.tempId!;
    const payload = action.payload;

    // Send to Server
    const { data: serverResponse } = await API.post('/polls', payload);
    const realServerId = serverResponse._id;
    console.log(`Poll created! API responded with id ${realServerId}`);

    await db.transaction('rw', db.polls, db.syncQueue, async () => {
        const poll = await db.polls.get(localId);
        
        if (poll) {
            // Delete temp, insert real
            await db.polls.delete(localId);
            await db.polls.add({
                ...poll,
                _id: realServerId,
                syncStatus: 'synced'
            });
        }
        await db.syncQueue.update(action.id!, { status: 'completed' });
    });
}

// Vote on a poll
async function handleVotePoll(action: SyncAction) {
    const { pollId, optionIndex } = action.payload;

    // Send vote to server
    await API.post(`/polls/${pollId}/vote`, { optionIndex });
    console.log(`Vote added`);
    // Mark as synced locally
    await db.transaction('rw', db.polls, db.syncQueue, async () => {
        await db.polls.update(pollId, { syncStatus: 'synced' });
        
        await db.syncQueue.update(action.id!, { status: 'completed' });
    });
}

// Create a note
async function handleCreateNote(action: SyncAction) {
    const localId = action.tempId!;
    const payload = action.payload;

    const { data: serverResponse } = await API.post('/notes', payload);
    const realServerId = serverResponse._id;
    console.log(`Note created! API responded with id ${realServerId}`);
    await db.transaction('rw', db.notes, db.noteComments, db.syncQueue, async () => {
        const note = await db.notes.get(localId);
        if (note) {
            await db.notes.delete(localId);
            await db.notes.add({
                ...note,
                _id: realServerId,
                syncStatus: 'synced'
            });
        }

        await db.noteComments.where('noteId').equals(localId).modify({
            noteId: realServerId
        });

        await db.syncQueue.update(action.id!, { status: 'completed' });
    });
}

// Create note comment 
async function handleCreateNoteComment(action: SyncAction) {
    const localId = action.tempId!;
    const payload = action.payload; // Contains { content: "...", noteId: "..." }

    const currentLocalComment = await db.noteComments.get(localId);
    
    if (currentLocalComment) {
        // Use the freshest noteId from the database
        payload.noteId = currentLocalComment.noteId;
    }

    // Now send to server
    const { data: serverResponse } = await API.post(`/notes/${payload.noteId}/comments`, payload);
    const realServerId = serverResponse._id;
    console.log(`Note comment created! API responded with id ${realServerId}`);
    await db.transaction('rw', db.noteComments, db.syncQueue, async () => {
        const comment = await db.noteComments.get(localId);
        if (comment) {
            await db.noteComments.delete(localId);
            await db.noteComments.add({
                ...comment,
                _id: realServerId,
                syncStatus: 'synced'
            });
        }
        await db.syncQueue.update(action.id!, { status: 'completed' });
    });
}