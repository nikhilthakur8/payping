import { z } from "zod";

export const createOrderSchema = z.object({
	body: z.object({
		amount: z.number().positive("Amount must be greater than zero"),
		clientRef: z.string().min(1, "Client Reference is required"),
		note: z.string().optional(),
	}),
});

export const createOrderDashboardSchema = z.object({
	body: z.object({
		amount: z.number().positive("Amount must be greater than zero"),
		clientRef: z.string().min(1, "Client Reference is required").optional(),
		note: z.string().optional(),
	}),
});
