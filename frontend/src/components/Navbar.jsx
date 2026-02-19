import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAppContext } from "@/context/AppContext";
import { Moon, Sun, Monitor, Palette, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const { theme, setTheme } = useTheme();
	const { token, logout } = useAppContext();
	const [themeOpen, setThemeOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const dropdownRef = useRef(null);
	const isDashboard = location.pathname.startsWith("/dashboard");

	useEffect(() => {
		function handleClickOutside(e) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target)
			) {
				setThemeOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const themes = [
		{ value: "light", label: "Light", icon: Sun },
		{ value: "dark", label: "Dark", icon: Moon },
		{ value: "system", label: "System", icon: Monitor },
	];

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-border/90 bg-background/80 backdrop-blur-sm">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
				<Link to="/" className="text-xl font-bold tracking-tight">
					PayPing
				</Link>

				{/* Desktop nav */}
				<div className="hidden md:flex items-center gap-2">
					{/* Theme dropdown */}
					<div className="relative" ref={dropdownRef}>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setThemeOpen((prev) => !prev)}
							aria-label="Toggle theme"
						>
							<Palette className="h-4 w-4" />
						</Button>

						{themeOpen && (
							<div className="absolute right-0 mt-2 w-36 rounded-md border bg-popover p-1 shadow-md">
								{themes.map(({ value, label, icon: Icon }) => (
									<button
										key={value}
										onClick={() => {
											setTheme(value);
											setThemeOpen(false);
										}}
										className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
											theme === value
												? "bg-accent text-accent-foreground"
												: "text-popover-foreground"
										}`}
									>
										<Icon className="h-4 w-4" />
										{label}
									</button>
								))}
							</div>
						)}
					</div>

					{token ? (
						<>
							{!isDashboard && (
								<Button
									variant="outline"
									onClick={() => navigate("/dashboard")}
								>
									Dashboard
								</Button>
							)}
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								aria-label="Logout"
							>
								<LogOut className="h-4 w-4" />
							</Button>
						</>
					) : (
						<>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/login")}
							>
								Login
							</Button>
							<Button
								size="sm"
								onClick={() => navigate("/register")}
							>
								Sign Up
							</Button>
						</>
					)}
				</div>

				{/* Mobile hamburger */}
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					onClick={() => setMobileOpen((prev) => !prev)}
					aria-label="Toggle menu"
				>
					{mobileOpen ? (
						<X className="h-5 w-5" />
					) : (
						<Menu className="h-5 w-5" />
					)}
				</Button>
			</div>

			{/* Mobile menu */}
			{mobileOpen && (
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
