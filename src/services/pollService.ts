import type { Poll } from '../types/models';
import API from './apiService';
import axios from 'axios';


export interface IPollOptionInput {
    text: string;
}
export interface IPollCreateData {
    groupId: string;
    question: string;
    options: IPollOptionInput[];
}


// Creates a new poll
// POST /api/polls
export async function createPoll(data: IPollCreateData): Promise<Poll> {
    try {
        const response = await API.post('/polls', data); // Send new poll question/options
        
        // Check for 201 Created status
        if (response.status === 201) {
            return response.data; // Return the new poll object
        }

        throw new Error(response.data.message || 'Failed to create poll.');

    } catch (error) {
        // Handle network/server error
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error creating poll.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Fetches all polls for a specific group
// GET /api/polls?groupId=ID
export async function getPollsByGroup(groupId: string): Promise<Poll[]> {
    const params = { groupId }; // Pass groupId as a query parameter
    
    try {
        const response = await API.get('/polls', { params }); // Fetches polls from API

        // Check for 200 OK status
        if (response.status === 200) {
            return response.data; // Return array of polls
        }
        
        throw new Error(response.data.message || 'Failed to fetch polls.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching polls.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Submits a vote for a specific poll option
// POST /api/polls/:id/vote
export async function submitVote(pollId: string, optionId: string): Promise<Poll> {
    const data = { optionId }; // Send the ID of the option selected
    try {
        // Endpoint includes the poll ID in the path
        const response = await API.post(`/polls/${pollId}/vote`, data); 

        // Check for 200 OK status
        if (response.status === 200) {
            return response.data; // Return the updated poll with new vote counts
        }

        throw new Error(response.data.message || 'Failed to submit vote.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error submitting vote.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Deletes a poll
// DELETE /api/polls/:id
export async function deletePoll(pollId: string): Promise<{ message: string }> {
    try {
        const response = await API.delete(`/polls/${pollId}`); // Call delete endpoint
        
        // Check for 200 OK status
        if (response.status === 200) {
            return response.data; // Return success message
        }
        
        throw new Error(response.data.message || 'Failed to delete poll.');
        
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error deleting poll.');
        }
        throw new Error('Network error or unknown issue.');
    }
}