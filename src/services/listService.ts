import type { List } from '../types/models';
import API from './apiService';
import axios from 'axios';

interface ListCreateData {
    name: string;
    groupId?: string; 
    color?: string;
    isDeleted?: boolean;
    description?: string;
    isPinned?: boolean;
}

export async function createList(data: ListCreateData): Promise<List> {
    try {
        const response = await API.post('/lists', data);
        
        if (response.status === 201) {
            return response.data;
        }

        throw new Error(response.data.message || 'Failed to create list.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error creating list.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Get a list by id
export async function getList(listId: string): Promise<List> {
    try {
        const response = await API.get(`/lists/${listId}`);
        if (response.status === 200) {
            return {...response.data, isDirty: false};
        }
        throw new Error(response.data.message || 'Failed to get list.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching list.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
// Get all lists of a group
export async function getGroupLists(groupId: string): Promise<List[]> {
    try {
        const response = await API.get(`/lists?groupId=${groupId}`);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error(response.data.message || 'Failed to get lists.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching lists.');
        }
        throw new Error('Network error or unknown issue.');
    }
}


// Updates an existing list's properties (e.g., name, color, isPinned).
// PUT /api/lists/:id
export async function updateList(listId: string, data: Partial<ListCreateData>): Promise<List> {
    try {
        const response = await API.patch(`/lists/${listId}`, data); 

        if (response.status === 200) {
            return response.data;
        }

        throw new Error(response.data.message || 'Failed to update list.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error updating list.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Soft-deletes a list.
// DELETE /api/lists/:id (Backend sets isDeleted: true)
export async function deleteList(listId: string): Promise<{ message: string }> {
    try {
        const response = await API.delete(`/lists/${listId}`); 
        
        if (response.status === 200) {
            return response.data;
        }
        
        throw new Error(response.data.message || 'Failed to delete list.');
        
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error deleting list.');
        }
        throw new Error('Network error or unknown issue.');
    }
}
