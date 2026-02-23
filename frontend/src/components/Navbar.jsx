import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAppContext } from "@/context/AppContext";
import { Moon, Sun, Monitor, Palette, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const { theme, setTheme } = useTheme();
	const { token, logout, sidebarOpen, setSidebarOpen } = useAppContext();
	const [mobileOpen, setMobileOpen] = useState(false);
	const isDashboard = location.pathname.startsWith("/dashboard");

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-border/90 bg-background/80 backdrop-blur-sm">
			<div className={`${isDashboard ? "w-full px-0" : "mx-auto max-w-7xl px-4"} flex h-14 items-center`}>
				<div 
					className={cn(
						"flex items-center h-full px-4",
						isDashboard && "md:w-56 md:border-r border-border/40"
					)}
				>
					<Link to="/" className="flex items-center gap-2.5 group">
						<div className="h-8 w-8 rounded-lg bg-primary overflow-hidden flex items-center justify-center p-0.5 shadow-sm group-hover:scale-105 transition-transform">
							<img src="/logo.png" alt="PayPing" className="w-full h-full object-contain invert dark:invert-0" />
						</div>
						<span className="text-xl font-bold tracking-tight">
							PayPing
						</span>
					</Link>
				</div>

				<div className="flex-1 flex items-center justify-between px-4">
					<div className="flex-1" /> {/* Spacer */}
					
					<div className="flex items-center gap-2">
						{/* Theme toggle - simplified as per screenshot */}
						<Button
							variant="outline"
							size="icon"
							onClick={toggleTheme}
							className="h-9 w-9 rounded-lg bg-background border-border/50"
							aria-label="Toggle theme"
						>
							{theme === "dark" ? (
								<Sun className="h-[1.2rem] w-[1.2rem]" />
							) : (
								<Moon className="h-[1.2rem] w-[1.2rem]" />
							)}
						</Button>

						{/* Desktop nav links */}
						<div className="hidden md:flex items-center gap-2 ml-2">
							{token ? (
								<>
									{!isDashboard && (
										<Button
											variant="outline"
											onClick={() => navigate("/dashboard")}
											className="h-9"
										>
											Dashboard
										</Button>
									)}
								</>
							) : (
								<>
									<Button
										variant="ghost"
										size="sm"
										className="h-9"
										onClick={() => navigate("/login")}
									>
										Login
									</Button>
									<Button
										size="sm"
										className="h-9"
										onClick={() => navigate("/register")}
									>
										Sign Up
									</Button>
								</>
							)}
						</div>

						{/* Mobile menu trigger / Sidebar trigger */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden h-10 w-10 rounded-full bg-muted/50"
							onClick={() => {
								if (isDashboard) {
									setSidebarOpen(!sidebarOpen);
								} else {
									setMobileOpen(!mobileOpen);
								}
							}}
							aria-label="Toggle menu"
						>
							{mobileOpen || (isDashboard && sidebarOpen) ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile menu for non-dashboard pages */}
			{!isDashboard && mobileOpen && (
				<div className="md:hidden border-t border-border/40 bg-background px-4 pb-4 pt-2 space-y-2">
					{/* Theme options */}
					<div className="flex items-center gap-1">
						{themes.map(({ value, label, icon: Icon }) => (
							<button
								key={value}
								onClick={() => setTheme(value)}
								className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
									theme === value
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground hover:bg-accent/50"
								}`}
							>
								<Icon className="h-4 w-4" />
								{label}
							</button>
						))}
					</div>

					{token ? (
						<div className="flex flex-col gap-2">
							{!isDashboard && (
								<Button
									variant="outline"
									className="w-full"
									onClick={() => {
										navigate("/dashboard");
										setMobileOpen(false);
									}}
								>
									Dashboard
								</Button>
							)}
							<Button
								variant="ghost"
								className="w-full"
								onClick={() => {
									handleLogout();
									setMobileOpen(false);
								}}
							>
								<LogOut className="h-4 w-4 mr-2" />
								Logout
							</Button>
						</div>
					) : (
						<div className="flex flex-col gap-2">
							<Button
								variant="ghost"
								className="w-full"
								onClick={() => {
									navigate("/login");
									setMobileOpen(false);
								}}
							>
								Login
							</Button>
							<Button
								className="w-full"
								onClick={() => {
									navigate("/register");
									setMobileOpen(false);
								}}
							>
								Sign Up
							</Button>
						</div>
					)}
				</div>
			)}
		</nav>
	);
}
