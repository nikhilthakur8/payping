import express from "express";
import {
	createController,
	getAllController,
	getOneController,
	updateController,
	deleteController,
	getProvidersController,
} from "../controllers/providerAccountController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
	createProviderAccountSchema,
	updateProviderAccountSchema,
} from "../validations/providerAccountSchema.js";

const router = express.Router();

// All routes are protected and require verification
router.use(authMiddleware);

router.post("/", validate(createProviderAccountSchema), createController);
router.get("/", getAllController);
router.get("/all-providers", getProvidersController);
router.get("/:id", getOneController);
router.put("/:id", validate(updateProviderAccountSchema), updateController);
router.delete("/:id", deleteController);

export default router;
