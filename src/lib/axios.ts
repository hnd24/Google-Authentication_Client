import {useAuthStore} from '@/store/useAuthStore';
import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true, // Quan trọng để gửi nhận Http-only Cookie
});

// Interceptor: Tự động thêm Bearer Token vào mọi Request
api.interceptors.request.use(config => {
	const token = useAuthStore.getState().accessToken;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
