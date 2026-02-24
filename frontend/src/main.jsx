import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppProvider } from "./context/AppContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
	<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
		<AppProvider>
			<App />
			<Analytics />
		</AppProvider>
	</GoogleOAuthProvider>
);
