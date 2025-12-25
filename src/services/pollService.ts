import type { Poll, PollOption } from '../types/models';
import API from './apiService';
import axios from 'axios';

export interface IPollCreateData {
    groupId: string;
    title: string;
    description?: string;
    options: string[];
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

// Deletes a poll
// DELETE /api/polls/:id
export async function deletePoll(pollId: string): Promise<{ message: string }> {
    try {
        const response = await API.delete(`/polls/${pollId}`);
        return response.data;
    } catch (error) {
        throw new Error(axios.isAxiosError(error) ? error.response?.data.message : 'Failed to delete poll');
    }
}