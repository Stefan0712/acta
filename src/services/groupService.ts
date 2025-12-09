import type { Group } from '../types/models.ts';
import API from './apiService.ts';
import axios from 'axios';

interface GroupCreateData {
    name: string;
    description?: string;
}

export async function createGroup(data: GroupCreateData): Promise<Group> {
    try {
        const response = await API.post('/groups', data);
        
        if (response.status === 201) {
            return response.data; 
        }

        throw new Error(response.data.message || 'Failed to create group.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error creating group.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Fetches all groups for the current user (GET /api/groups)
export async function getMyGroups(): Promise<Group[]> {
    try {
        const response = await API.get('/groups');

        if (response.status === 200) {
            return response.data; // Array of group objects
        }
        
        throw new Error(response.data.message || 'Failed to fetch groups.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching groups.');
        }
        throw new Error('Network error or unknown issue.');
    }
}