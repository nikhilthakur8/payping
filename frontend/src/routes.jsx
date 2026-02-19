import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Providers from "./pages/Providers";
import PaymentOrders from "./pages/PaymentOrders";
import DashboardSettings from "./pages/DashboardSettings";
import Developer from "./pages/Developer";
import ApiDocs from "./pages/ApiDocs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import PaymentPage from "./pages/PaymentPage";
import MainLayout from "./components/MainLayout";
import DashboardLayout from "./components/DashboardLayout";
import {
	ProtectedWrapper,
	AuthWrapper,
	PublicWrapper,
} from "./components/RouteWrappers";

const router = createBrowserRouter([
	{
		path: "/payment/:internalRef",
		element: <PaymentPage />,
	},
	{
		element: <MainLayout />,
		children: [
			// Public landing page
			{
				element: <PublicWrapper />,
				children: [{ path: "/", element: <Home /> }],
			},
			// Protected dashboard with sidebar
			{
				element: <ProtectedWrapper />,
				children: [
					{
						path: "/dashboard",
						element: <DashboardLayout />,
						children: [
							{ index: true, element: <Dashboard /> },
							{ path: "providers", element: <Providers /> },
							{ path: "orders", element: <PaymentOrders /> },
							{ path: "api-docs", element: <ApiDocs /> },
							{ path: "developer", element: <Developer /> },
							{
								path: "settings",
								element: <DashboardSettings />,
							},
						],
					},
				],
			},
		],
	},
	// Protected route — require login but NOT verified email (no navbar)
	{
		element: <ProtectedWrapper requireVerified={false} />,
		children: [{ path: "/verify-otp", element: <VerifyOTP /> }],
	},
	// Auth routes — only accessible when NOT logged in (no navbar)
	{
		element: <AuthWrapper />,
		children: [
			{ path: "/login", element: <Login /> },
			{ path: "/register", element: <Register /> },
		],
	},
]);

export default router;
