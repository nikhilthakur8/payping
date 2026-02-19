import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
	try {
		schema.parse({
			body: req.body,
			query: req.query,
			params: req.params,
		});
		next();
	} catch (e) {
		if (e instanceof z.ZodError) {
			return res.status(400).json({
				status: "error",
				errors: e.errors.map((err) => ({
					path: err.path.join("."),
					message: err.message,
				})),
			});
		}
		next(e);
	}
};
