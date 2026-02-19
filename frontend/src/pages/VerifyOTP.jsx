import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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

const verifyOTPSchema = z.object({
	otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function VerifyOTP() {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, refetchProfile } = useAppContext();
	const email = location.state?.email || user?.email || "";

	const [otpSent, setOtpSent] = useState(false);
	const [sending, setSending] = useState(false);

	const form = useForm({
		resolver: zodResolver(verifyOTPSchema),
		defaultValues: {
			otp: "",
		},
	});

	async function sendOTP() {
		if (!email) {
			toast.error("No email found. Please login again.");
			return;
		}
		setSending(true);
		try {
			await API.post("/auth/send-otp", { email });
			toast.success("OTP sent to your email");
			setOtpSent(true);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to send OTP");
		} finally {
			setSending(false);
		}
	}

	async function onSubmit(values) {
		try {
			await API.post("/auth/verify-otp", { email, otp: values.otp });
			await refetchProfile();
			toast.success("OTP verified successfully.");
			navigate("/");
		} catch (error) {
			toast.error(error.response?.data?.message || "Verification failed");
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<Card className="w-100">
				<CardHeader>
					<CardTitle className="text-2xl">Verify Email</CardTitle>
					<CardDescription>
						{otpSent ? (
							<>
								Enter the 6-digit code sent to{" "}
								<span className="font-medium text-foreground">
									{email}
								</span>
							</>
						) : (
							<>
								We need to verify{" "}
								<span className="font-medium text-foreground">
									{email}
								</span>
								. Click below to receive your OTP.
							</>
						)}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!otpSent ? (
						<Button
							className="w-full"
							onClick={sendOTP}
							disabled={sending}
						>
							{sending ? "Sending..." : "Send OTP"}
						</Button>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="otp"
									render={({ field }) => (
										<FormItem>
											<FormLabel>OTP</FormLabel>
											<FormControl>
												<Input
													placeholder="123456"
													maxLength={6}
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
										? "Verifying..."
										: "Verify OTP"}
								</Button>
							</form>
						</Form>
					)}
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					{otpSent && (
						<Button
							variant="ghost"
							className="w-full text-sm"
							onClick={sendOTP}
							disabled={sending}
						>
							{sending ? "Sending..." : "Resend OTP"}
						</Button>
					)}
					<p className="text-sm text-muted-foreground">
						Back to{" "}
						<Link
							to="/login"
							className="text-primary hover:underline"
						>
							Login
						</Link>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
