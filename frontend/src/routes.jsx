import { lazy, Suspense } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Providers = lazy(() => import("./pages/Providers"));
const PaymentOrders = lazy(() => import("./pages/PaymentOrders"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const Developer = lazy(() => import("./pages/Developer"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const WebhookLogs = lazy(() => import("./pages/WebhookLogs"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));

// Lazy load layouts
const MainLayout = lazy(() => import("./components/MainLayout"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));

import {
	ProtectedWrapper,
	AuthWrapper,
	PublicWrapper,
} from "./components/RouteWrappers";

const PageLoader = () => (
	<div className="flex h-[60vh] w-full items-center justify-center">
		<Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
	</div>
);

const SuspenseLayout = () => (
	<Suspense fallback={<PageLoader />}>
		<Outlet />
	</Suspense>
);

const router = createBrowserRouter([
	{
		element: <SuspenseLayout />,
		children: [
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
								{ path: "webhooks", element: <WebhookLogs /> },
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
		],
	},
]);

export default router;
