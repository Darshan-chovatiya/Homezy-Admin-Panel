import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { type Admin, type ApiResponse } from "../services/api";

type AuthUser = Admin | null;

type LoginPayload = {
	email: string;
	password: string;
};

type RegisterPayload = Partial<Admin> & { password: string };

type AuthContextType = {
	user: AuthUser;
	token: string | null;
	isLoading: boolean;
	login: (payload: LoginPayload) => Promise<ApiResponse<string>>;
	register: (payload: RegisterPayload) => Promise<ApiResponse<Admin>>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
	return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthUser>(null);
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		const savedToken = localStorage.getItem("authToken");
		const savedUser = localStorage.getItem("user");
		if (savedToken) {
			setToken(savedToken);
		}
		if (savedUser) {
			try {
				setUser(JSON.parse(savedUser));
			} catch (error) {
				console.error("Error parsing saved user:", error);
				localStorage.removeItem("user");
			}
		}
		setIsLoading(false);
	}, []);

	const login = useCallback(async ({ email, password }: LoginPayload) => {
		setIsLoading(true);
		try {
			const res = await api.login(email, password);
			if (res.data) {
				const tokenString = String(res.data);
				
				// Save token to both state and localStorage
				setToken(tokenString);
				localStorage.setItem('authToken', tokenString);
				
				// Create a basic user object since backend only returns token
				const userObj: Admin = {
					_id: email.split('@')[0] + '_' + Date.now(), // Generate a unique ID
					emailId: email,
					email: email,
					name: email.split('@')[0], // Use email prefix as name
				};
				
				setUser(userObj);
				localStorage.setItem('user', JSON.stringify(userObj));
			}
			return res;
		} catch (error) {
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const register = useCallback(async (payload: RegisterPayload) => {
		setIsLoading(true);
		try {
			const res = await api.register(payload);
			return res;
		} finally {
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		setIsLoading(true);
		try {
			await api.logout();
			setUser(null);
			setToken(null);
			localStorage.removeItem('user');
			localStorage.removeItem('authToken'); // Also remove token from localStorage
		} finally {
			setIsLoading(false);
		}
	}, []);

	const value = useMemo<AuthContextType>(
		() => ({ user, token, isLoading, login, register, logout }), 
		[user, token, isLoading, login, register, logout]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}