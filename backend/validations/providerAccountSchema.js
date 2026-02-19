import { z } from "zod";

export const createProviderAccountSchema = z.object({
	body: z.object({
		provider: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid provider ID"),
		merchantId: z.string().min(1, "Merchant ID is required"),
		vpa: z.string().min(3, "VPA is required"),
		isDefault: z.boolean().optional(),
	}),
});

export const updateProviderAccountSchema = z.object({
	body: z.object({
		merchantId: z.string().optional(),
		vpa: z.string().min(3, "VPA is required").optional(),
		isDefault: z.boolean().optional(),
	}),
	params: z.object({
		id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid account ID"),
	})
});
