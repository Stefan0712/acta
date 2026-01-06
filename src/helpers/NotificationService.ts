import API from '../services/apiService';
import type { Notification } from '../types/models';
import axios from 'axios';



export async function getNotifications(): Promise<Notification[]> {
    try {
        const response = await API.get('/notifications');
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error getting notifications.');
        }
        throw new Error('Network error or unknown issue.');
    }
}