import { db } from '../db';
import type { Poll, PollOption } from '../types/models';
import API from './apiService';
import axios from 'axios';

export interface IPollCreateData {
    groupId: string;
    title: string;
    description?: string;
    options: string[] | Poll[];
    allowCustomOptions: boolean;
    expiresAt: Date | string;
}
export interface IPollUpdateData {
    title: string;
    description?: string;
    options: PollOption[];
    allowCustomOptions: boolean;
    expiresAt: Date | string;
}

// Creates a new poll
// POST /api/polls
export async function createPoll(data: IPollCreateData): Promise<Poll> {
    try {
        const response = await API.post('/polls', data);
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to create poll');
    }
}

// Fetches a single poll by its ID
// GET /api/polls/:id
export async function getPollById(pollId: string): Promise<Poll> {
    try {
        const response = await API.get(`/polls/${pollId}`);
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to fetch poll details');
    }
}


// Fetches all polls for a group
// GET /api/polls/group/:groupId
export async function getPollsByGroup(groupId: string): Promise<Poll[]> {
    try {
        const response = await API.get(`/polls/group/${groupId}`);
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to fetch polls');
    }
}

// Submits or changes a vote
// POST /api/polls/vote
export async function submitVote(pollId: string, optionId: string): Promise<Poll> {
    try {
        const response = await API.post('/polls/vote', { pollId, optionId });
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to submit vote');
    }
}
// Updates poll details (title, description, deadline, etc.)
// PATCH /api/polls/:id
export async function updatePoll(pollId: string, data: Partial<IPollUpdateData> & { isClosed?: boolean }): Promise<Poll> {
    try {
        const response = await API.patch(`/polls/${pollId}`, data);
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to update poll');
    }
}
// Adds a custom option to an existing poll
// POST /api/polls/option
export async function addPollOption(pollId: string, text: string): Promise<PollOption> {
    try {
        const response = await API.post('/polls/option', { pollId, text });
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to add option');
    }
}
// End a poll
export async function endPoll(pollId: string): Promise<Poll> {
    try {
        const response = await API.patch(`/polls/${pollId}/end`);
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to add option');
    }
}

// Deletes a poll
// DELETE /api/polls/:id
export async function deletePoll(pollId: string): Promise<{ message: string }> {
    try {
        const response = await API.delete(`/polls/${pollId}`);
        if (response.status === 404) {
            console.warn("Poll removed");
            await db.polls.delete(pollId);
            return { message: 'Poll removed.' };
        } else {
        return response.data;
        }
    } catch (error: any) {
         throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to delete poll');
    }
}