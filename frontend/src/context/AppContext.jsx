import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import API from "@/lib/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("token") || null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = useCallback(async (authToken) => {
		if (!authToken) {
			setUser(null);
			setLoading(false);
			return;
		}
		try {
			const { data } = await API.get("/user/profile", {
				headers: { Authorization: `Bearer ${authToken}` },
			});
			setUser(data.data);
		} catch {
			// Token is invalid or expired — clear it
			localStorage.removeItem("token");
			setToken(null);
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProfile(token);
	}, [token, fetchProfile]);

	const login = (userToken) => {
		localStorage.setItem("token", userToken);
		setToken(userToken);
		// fetchProfile will be triggered by the token state change via useEffect
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
	};

	const isVerified = user?.isVerified ?? false;

	return (
		<AppContext.Provider
			value={{
				user,
				token,
				isVerified,
				login,
				logout,
				loading,
				refetchProfile: () => fetchProfile(token),
			}}
		>
			{children}
		</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within an AppProvider");
	}
	return context;
};
