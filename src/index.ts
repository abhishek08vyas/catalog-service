import "reflect-metadata";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "dotenv";
import { AppDataSource } from "./config/database";
import { categoryRoutes } from "./routes/CategoryRoutes";
import { productRoutes } from "./routes/ProductRoutes";

config();

const fastify = Fastify({
	logger: true,
});

async function start() {
	try {
		// Initialize database
		await AppDataSource.initialize();
		console.log("Database connected successfully");

		// Register CORS
		await fastify.register(cors, {
			origin: true,
		});

		// Health check
		fastify.get("/health-check/liveness", async () => {
			return { status: "ok", service: "catalog-service" };
		});

		// Register routes
		await fastify.register(categoryRoutes, { prefix: "/api" });
		await fastify.register(productRoutes, { prefix: "/api" });

		const port = parseInt(process.env.PORT || "3000");
		await fastify.listen({ port, host: "0.0.0.0" });
		console.log(`Server running on port ${port}`);
	} catch (error) {
		console.error("Error starting server:", error);
		process.exit(1);
	}
}

start();
