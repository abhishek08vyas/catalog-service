import "reflect-metadata";
import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { AppDataSource } from "./config/database";
import { categoryRoutes } from "./routes/CategoryRoutes";
import { productRoutes } from "./routes/ProductRoutes";

export async function createFastifyApp(): Promise<FastifyInstance> {
	const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME;

	const fastify = Fastify({
		logger: {
			level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "warn" : "info"),
			...(process.env.NODE_ENV !== "production" && {
				transport: {
					target: "pino-pretty",
					options: {
						colorize: true,
						translateTime: "HH:MM:ss Z",
						ignore: "pid,hostname",
					},
				},
			}),
		},
		disableRequestLogging: process.env.NODE_ENV === "production",
		// Important for serverless: configure for request/response handling without listening
		...(isServerless && {
			connectionTimeout: 0,
			keepAliveTimeout: 0,
		}),
	});

	// Register CORS with better security defaults
	await fastify.register(cors, {
		origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : process.env.NODE_ENV === "production" ? false : true,
		credentials: true,
	});

	// Health check endpoints
	fastify.get("/health-check/liveness", async () => {
		return {
			status: "ok",
			service: "catalog-service",
			timestamp: new Date().toISOString(),
		};
	});

	fastify.get("/health-check/readiness", async (_request, reply) => {
		try {
			if (AppDataSource.isInitialized) {
				// Try a simple query to check DB connection
				await AppDataSource.query("SELECT 1");
				return {
					status: "ready",
					service: "catalog-service",
					database: "connected",
					timestamp: new Date().toISOString(),
				};
			} else {
				reply.status(503);
				return {
					status: "not ready",
					service: "catalog-service",
					database: "not connected",
					timestamp: new Date().toISOString(),
				};
			}
		} catch (error) {
			reply.status(503);
			return {
				status: "not ready",
				service: "catalog-service",
				database: "error",
				error: process.env.NODE_ENV === "development" ? String(error) : undefined,
				timestamp: new Date().toISOString(),
			};
		}
	});

	// Register API routes with versioning
	await fastify.register(categoryRoutes, { prefix: "/api/v1" });
	await fastify.register(productRoutes, { prefix: "/api/v1" });

	// Global error handler
	fastify.setErrorHandler((error, _request, reply) => {
		fastify.log.error(error);

		// Don't expose internal errors in production
		const isDevelopment = process.env.NODE_ENV === "development";

		if (error.statusCode) {
			reply.status(error.statusCode).send({
				success: false,
				error: error.message || "Request failed",
				...(isDevelopment && { stack: error.stack }),
			});
		} else {
			reply.status(500).send({
				success: false,
				error: isDevelopment ? error.message : "Internal server error",
				...(isDevelopment && { stack: error.stack }),
			});
		}
	});

	// 404 handler
	fastify.setNotFoundHandler((request, reply) => {
		reply.status(404).send({
			success: false,
			error: "Route not found",
			path: request.url,
		});
	});

	return fastify;
}
