// API 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const USER_API_END_POINT = `${API_BASE_URL}/api/v1/user`;
export const PAN_API_END_POINT = `${API_BASE_URL}/api/v1/pan`;
export const ADMIN_API_END_POINT = `${API_BASE_URL}/api/v1/admin`;
export const SUBADMIN_API_END_POINT = `${API_BASE_URL}/api/v1/subadmin`;
export const CHAT_API_END_POINT = `${API_BASE_URL}/api/v1/chat`;
export const SOCKET_URL = API_BASE_URL;
