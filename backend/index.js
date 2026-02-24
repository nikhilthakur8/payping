import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middleware/authMiddleware.js";
import cleanupJob from "./cron/orderCleanup.js";
import { webhookRetryJob } from "./services/webhookService.js";

// Start Cron Jobs
cleanupJob.start();
webhookRetryJob.start();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/", routes);

// Error Handling Middleware
app.use(errorMiddleware);

// Start Server and Connect Database
app.listen(PORT, async () => {
	console.log(`Server is running on port ${PORT}`);
	await connectDB();
});
