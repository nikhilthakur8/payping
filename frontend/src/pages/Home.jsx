import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";

export default function Home() {
	const navigate = useNavigate();
	const { token } = useAppContext();

	return (
		<>
			{/* Hero */}
			<section className="flex flex-col items-center justify-center px-4 text-center min-h-[90vh]">
				<h1 className="max-w-2xl text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
					Payments made <span className="text-primary">simple</span>
				</h1>
				<p className="mt-4 max-w-lg text-lg text-muted-foreground">
					Accept payments from multiple providers with a single
					integration. Fast, secure, and developer-friendly.
				</p>
				<div className="mt-8 flex gap-3">
					{token ? (
						<Button
							size="lg"
							onClick={() => navigate("/dashboard")}
						>
							Go to Dashboard
							<ArrowRight className="ml-1 h-4 w-4" />
						</Button>
					) : (
						<>
							<Button
								size="lg"
								onClick={() => navigate("/register")}
							>
								Get Started
								<ArrowRight className="ml-1 h-4 w-4" />
							</Button>
							<Button
								size="lg"
								variant="outline"
								onClick={() => navigate("/login")}
							>
								Login
							</Button>
						</>
					)}
				</div>
			</section>
		</>
	);
}
