import {create} from 'zustand';
import {persist} from 'zustand/middleware';

export interface User {
	id: number;
	email: string;
	full_name?: string;
	picture?: string;
}

interface AuthState {
	user: User | null;
	accessToken: string | null;
	setAuth: (user: User, token: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			user: null,
			accessToken: null,
			setAuth: (user, token) => set({user, accessToken: token}),
			logout: () => set({user: null, accessToken: null}),
		}),
		{name: 'auth-storage'},
	),
);
