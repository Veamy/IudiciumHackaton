import axios from "axios";

const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({

  baseURL: API_BASE_URL, 
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;