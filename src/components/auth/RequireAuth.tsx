import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth() {
	const { user, isLoading } = useAuth();
	const location = useLocation();

	if (isLoading) return null;

	if (!user) {
		return <Navigate to="/signin" replace state={{ from: location }} />;
	}

	return <Outlet />;
}


