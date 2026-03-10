// API helper — Axios instance with base URL and auto auth headers
// Usage: import api from '@/lib/api'; then api.get('/notices')

import axios from 'axios';

let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Clean up baseURL to prevent issues on Vercel
if (baseURL) {
    // Remove trailing slash if present
    baseURL = baseURL.replace(/\/+$/, '');
    
    // If baseURL ends with '/api', strip it because frontend calls already include '/api'
    if (baseURL.endsWith('/api')) {
        baseURL = baseURL.slice(0, -4);
    }
    
    // If the user mistakenly set API URL to literally 'api' or '/api' in Vercel
    if (baseURL === 'api' || baseURL === '') {
        baseURL = ''; // Let Axios use relative paths in the browser
    }
} else if (typeof window !== 'undefined') {
    // Fallback block if NEXT_PUBLIC_API_URL is completely undefined on client side
    baseURL = '';
}

const api = axios.create({
    baseURL,
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
