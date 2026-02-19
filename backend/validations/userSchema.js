import { z } from "zod";

export const updateProfileSchema = z.object({
	body: z.object({
		name: z.string().min(2, "Name must be at least 2 characters").optional(),
		callbackUrl: z.string()
			.optional()
			.refine(val => !val || /^(http|https):\/\/[^ "]+$/.test(val), {
				message: "Callback URL must be a valid URL starting with http:// or https://"
			}),
	}),
});
