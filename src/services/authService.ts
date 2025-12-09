import type { User } from '../types/models';
import API from './apiService';
import axios from 'axios';

export interface UserLoginData {
    email: string;
    password: string;
}

export interface UserRegisterData extends UserLoginData {
    username: string;
}
export interface AuthResponse {
    user: User;
    token: string;
}


// User Registration
// POST /api/auth/register
export async function register(data: UserRegisterData): Promise<User> {
    try {
        const response = await API.post('/auth/register', data); // Send new user credentials
        
        // Check for 201 Created status
        if (response.status === 201) {
            const { user, token }: AuthResponse = response.data; // Destructure user and token
            localStorage.setItem('jwt_token', token); // Store the token
            return user; // Return the user object
        }

        throw new Error(response.data.message || 'Registration failed.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error during registration.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// User Login
// POST /api/auth/login
export async function login(data: UserLoginData): Promise<User> {
    try {
        const response = await API.post('/auth/login', data); // Send credentials
        
        // Check for 200 OK status
        if (response.status === 200) {
            const { user, token }: AuthResponse = response.data; // Destructure user and token
            localStorage.setItem('jwt_token', token); // Store the token
            return user; // Return the user object
        }

        throw new Error(response.data.message || 'Login failed.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error during login.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// Get Current User Profile
// GET /api/auth/me
export async function getMe(): Promise<User> {
    try {
        // The token is automatically injected by apiService interceptor
        const response = await API.get('/auth/me'); 

        // Check for 200 OK status
        if (response.status === 200) {
            return response.data; // Return the current user object
        }

        // If 401 Unauthorized occurs, the response interceptor handles clearing the token
        throw new Error(response.data.message || 'Failed to fetch user profile.');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Server error fetching profile.');
        }
        throw new Error('Network error or unknown issue.');
    }
}

// User Logout
export function logout(): void {
    // We only need to clear the token locally, as the token is stateless on the server
    localStorage.removeItem('jwt_token'); 
}