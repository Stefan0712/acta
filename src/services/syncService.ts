import { db } from "../db";
import API from "./apiService";


export async function syncAllUserData() {
    try {
        console.log("Starting Background Sync...");
        
        // Fetch the data
        const { data } = await API.get('/sync'); 
        
        // Destructure
        const { groups, lists, items, notes, polls } = data;

        // Save to Local DB in parallel
        await Promise.all([
            cacheData(db.groups, groups),
            cacheData(db.lists, lists),
            cacheData(db.listItems, items),
            cacheData(db.notes, notes),
            cacheData(db.polls, polls)
        ]);
        console.log("Sync Complete");

    } catch (error) {
        console.error("Sync Failed:", error);
    }
}

// Cache items fetched using the sync route without replacing local edits that were not yet pushed to the API
async function cacheData(table: any, onlineItems: any[]) {
    if (!onlineItems || onlineItems.length === 0) return;

    await db.transaction('rw', table, async () => {
        
        // Find ids of items edited locally but haven't uploaded yet and make sure we don't overwrite them
        const localModifiedKeys = await table
            .where('syncStatus')
            .anyOf('pending_update', 'pending_upload') 
            .primaryKeys();

        const localModifiedSet = new Set(localModifiedKeys);

        // Filter the online data
        const itemsToSave = onlineItems.map((item: any) => {
            // If we have a local version waiting to upload, ignore the server version for now.
            if (localModifiedSet.has(item._id)) return null;

            return {
                ...item,
                syncStatus: 'synced',
                lastSyncedAt: new Date()
            };
        }).filter(Boolean); // Remove nulls

        // Bulk Save
        if (itemsToSave.length > 0) {
            await table.bulkPut(itemsToSave);
        }
    });
}