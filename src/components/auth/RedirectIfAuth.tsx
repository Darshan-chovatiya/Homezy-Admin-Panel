import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function RedirectIfAuth({ children }: { children: React.ReactNode }) {
	const { user, isLoading } = useAuth();
	if (isLoading) return null;
	if (user) return <Navigate to="/" replace />;
	return <>{children}</>;
}


