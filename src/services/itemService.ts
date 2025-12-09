import type { ShoppingListItem } from '../types/models';
import API from './apiService';
import axios from 'axios';

interface ItemCreateData {
    listId: string;
    name: string;
    qty?: number;
    unit?: string;
    category?: { _id: string, name: string };
    assignedTo?: string; // User ID
}

// Creates a new item within a list.
// POST /api/items
export async function createItem(data: ItemCreateData): Promise<ShoppingListItem> {
    try {
        const response = await API.post('/items', data);
        
        if (response.status === 201) {
            return response.data;
        }

        throw new Error(response.data.message || 'Failed to create item.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error creating item.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Fetches items for synchronization, filtered by a specific list.
// GET /api/items?listId=ID&since=DATE
export async function fetchItemsForSync(listId: string, lastSyncDate?: string): Promise<Item[]> {
    const params: any = { listId }; 
    if (lastSyncDate) {
        params.since = lastSyncDate;
    }
    
    try {
        const response = await API.get('/items', { params });

        if (response.status === 200) {
            return response.data;
        }
        
        throw new Error(response.data.message || 'Failed to fetch items.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error during item sync.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Updates an item (e.g., check/uncheck, rename, change quantity).
// PUT /api/items/:id
export async function updateItem(itemId: string, data: Partial<ItemCreateData | { isChecked: boolean }>): Promise<Item> {
    try {
        const response = await API.put(`/items/${itemId}`, data); 

        if (response.status === 200) {
            return response.data;
        }

        throw new Error(response.data.message || 'Failed to update item.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error updating item.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Soft-deletes a list item.
// DELETE /api/items/:id
export async function deleteItem(itemId: string): Promise<{ message: string }> {
    try {
        const response = await API.delete(`/items/${itemId}`); 
        
        if (response.status === 200) {
            return response.data;
        }
        
        throw new Error(response.data.message || 'Failed to delete item.');
        
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error deleting item.');
        }
        throw new Error('Network error or unknown issue.');
    }
}