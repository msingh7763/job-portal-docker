// src/utils/data.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

export const USER_API_ENDPOINT = `${API_BASE_URL}/api/users`;
export const JOB_API_ENDPOINT = `${API_BASE_URL}/api/job`;
export const COMPANY_API_ENDPOINT = `${API_BASE_URL}/api/company`;
export const APPLICATION_API_ENDPOINT = `${API_BASE_URL}/api/application`;
