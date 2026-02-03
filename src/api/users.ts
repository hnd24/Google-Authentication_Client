import api from '@/lib/axios';
import type {User} from '@/store/useAuthStore';

export const getMe = async (token?: string) => {
	// Nếu có truyền token, ép axios dùng token đó thay vì chờ store
	const config = token ? {headers: {Authorization: `Bearer ${token}`}} : {};
	const {data} = await api.get('/users/me', config);
	return data;
};

export const getAllUsers = async (): Promise<User[]> => {
	const {data} = await api.get('/users/all');
	return data;
};
