import "reflect-metadata";
import { config } from "dotenv";
import { AppDataSource } from "./config/database";
import { createFastifyApp } from "./app";

config();

async function start() {
	try {
		// Initialize database
		if (!AppDataSource.isInitialized) {
			await AppDataSource.initialize();
			console.log("Database connected successfully");
		}

		// Create Fastify app
		const fastify = await createFastifyApp();

		// Start server
		const port = parseInt(process.env.PORT || "3000", 10);
		const host = process.env.HOST || "0.0.0.0";

		await fastify.listen({ port, host });
		console.log(`Server running on http://${host}:${port}`);

		// Graceful shutdown
		const shutdown = async (signal: string) => {
			console.log(`Received ${signal}, shutting down gracefully...`);
			try {
				await fastify.close();
				if (AppDataSource.isInitialized) {
					await AppDataSource.destroy();
					console.log("Database connection closed");
				}
				console.log("Server shut down successfully");
				process.exit(0);
			} catch (error) {
				console.error("Error during shutdown:", error);
				process.exit(1);
			}
		};

		process.on("SIGTERM", () => shutdown("SIGTERM"));
		process.on("SIGINT", () => shutdown("SIGINT"));
	} catch (error) {
		console.error("Error starting server:", error);
		process.exit(1);
	}
}

// Only start server if not in serverless environment
if (require.main === module) {
	start();
}
