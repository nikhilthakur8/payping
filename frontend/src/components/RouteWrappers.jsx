import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

// Requires authentication. Redirects unverified users to /verify-otp by default.
export const ProtectedWrapper = ({ requireVerified = true }) => {
	const { token, isVerified, loading } = useAppContext();
	const location = useLocation();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	if (!token) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (requireVerified && !isVerified) {
		return <Navigate to="/verify-otp" replace />;
	}

	return <Outlet />;
};

// Only accessible when NOT logged in. Redirects logged-in users to home.
export const AuthWrapper = () => {
	const { token, loading } = useAppContext();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				Loading...
			</div>
		);
	}

	if (token) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

// No authentication rules — always renders.
export const PublicWrapper = () => {
	return <Outlet />;
};
