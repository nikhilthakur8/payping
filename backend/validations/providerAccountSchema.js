import { z } from "zod";

export const createProviderAccountSchema = z.object({
	body: z.object({
		provider: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid provider ID"),
		businessName: z.string().min(1, "Business name is required"),
		merchantId: z.string().min(1, "Merchant ID is required"),
		vpa: z.string().min(3, "VPA is required"),
		isDefault: z.boolean().optional(),
	}),
});

export const updateProviderAccountSchema = z.object({
	body: z.object({
		businessName: z.string().min(1, "Business name is required").optional(),
		merchantId: z.string().optional(),
		vpa: z.string().min(3, "VPA is required").optional(),
		isDefault: z.boolean().optional(),
	}),
	params: z.object({
		id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid account ID"),
	})
});
