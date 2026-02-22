import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import API from "@/lib/api";
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export default function Login() {
	const navigate = useNavigate();
	const { login } = useAppContext();
	const form = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(values) {
		try {
			const { data } = await API.post("/auth/login", values);
			login(data.data.token);
			toast.success("Logged in successfully");
			if (data.data.user.isVerified) {
				navigate("/");
			} else {
				navigate("/verify-otp", { state: { email: values.email } });
			}
		} catch (error) {
			toast.error(error.response?.data?.message || "Login failed");
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-background px-4">
			<Card className="max-w-md w-full">
				<CardHeader>
					<CardTitle className="text-2xl">Login</CardTitle>
					<CardDescription>
						Enter your credentials to access your account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="email@example.com"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="******"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full"
								disabled={form.formState.isSubmitting}
							>
								{form.formState.isSubmitting
									? "Logging in..."
									: "Login"}
							</Button>
						</form>
					</Form>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<p className="text-sm text-muted-foreground">
						Don't have an account?{" "}
						<Link
							to="/register"
							className="text-primary hover:underline"
						>
							Register
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
