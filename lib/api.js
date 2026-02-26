// API helper — Axios instance with base URL and auto auth headers
// Usage: import api from '@/lib/api'; then api.get('/notices')

import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — automatically attach JWT token from localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('school_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor — handle 401 (token expired) globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stored credentials
            localStorage.removeItem('school_token');
            localStorage.removeItem('school_user');
            // Redirect to login
            if (typeof window !== 'undefined') window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
