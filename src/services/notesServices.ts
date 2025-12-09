import type { Note } from '../types/models';
import API from './apiService';
import axios from 'axios';


export interface INoteCreateData {
    groupId: string;
    title: string;
    content: string;
}


// Creates a new note
// POST /api/notes
export async function createNote(data: INoteCreateData): Promise<Note> {
    try {
        const response = await API.post('/notes', data); // Send new note data
        
        // Check for 201 Created status
        if (response.status === 201) {
            return response.data; // Return the new note object
        }

        // Handles API-specific error messages
        throw new Error(response.data.message || 'Failed to create note.');

    } catch (error) {
        // Handles network errors
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error creating note.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Fetches all notes for a specific group
// GET /api/notes?groupId=ID
export async function getNotesByGroup(groupId: string): Promise<Note[]> {
    const params = { groupId }; // Prepare the query parameter
    
    try {
        const response = await API.get('/notes', { params }); // Fetches notes from API

        // Check for 200 OK status
        if (response.status === 200) {
            return response.data; // Return array of notes
        }
        
        throw new Error(response.data.message || 'Failed to fetch notes.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching notes.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Updates an existing note
// PUT /api/notes/:id
export async function updateNote(noteId: string, data: Partial<INoteCreateData>): Promise<Note> {
    try {
        const response = await API.put(`/notes/${noteId}`, data); // Send updated fields

        // Check for 200 OK status
        if (response.status === 200) {
            return response.data; // Return the updated note object
        }

        throw new Error(response.data.message || 'Failed to update note.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error updating note.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Deletes a note
// DELETE /api/notes/:id
export async function deleteNote(noteId: string): Promise<{ message: string }> {
    try {
        const response = await API.delete(`/notes/${noteId}`); // Call delete endpoint
        
        // Check for 200 OK status
        if (response.status === 200) {
            return response.data; // Return success message
        }
        
        throw new Error(response.data.message || 'Failed to delete note.');
        
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error deleting note.');
        }
        throw new Error('Network error or unknown issue.');
    }
}