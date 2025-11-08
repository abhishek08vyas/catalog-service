import "reflect-metadata";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AppDataSource } from "../src/config/database";
import { createFastifyApp } from "../src/app";

// Cache the Fastify app instance for serverless (reused across invocations)
// This improves cold start performance by reusing the app instance
let app: Awaited<ReturnType<typeof createFastifyApp>> | null = null;
let initPromise: Promise<Awaited<ReturnType<typeof createFastifyApp>>> | null = null;

async function getApp(): Promise<Awaited<ReturnType<typeof createFastifyApp>>> {
	if (app) {
		return app;
	}

	if (initPromise) {
		return initPromise;
	}

	initPromise = (async () => {
		try {
			// Initialize database connection
			if (!AppDataSource.isInitialized) {
				await AppDataSource.initialize().catch((error) => {
					console.error("Database initialization error:", error);
					// Don't throw - allow health checks to work even if DB is down
				});
			}

			const fastifyApp = await createFastifyApp();
			await fastifyApp.ready();
			app = fastifyApp;
			return fastifyApp;
		} catch (error) {
			console.error("Error initializing app:", error);
			throw error;
		} finally {
			initPromise = null;
		}
	})();

	return initPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
	try {
		const fastifyApp = await getApp();

		// Use Fastify's inject method - perfect for serverless environments
		// This bypasses the HTTP server layer and directly processes requests
		const response = await fastifyApp.inject({
			method: req.method || "GET",
			url: req.url || "/",
			headers: req.headers as Record<string, string>,
			payload: req.body ? (typeof req.body === "string" ? req.body : JSON.stringify(req.body)) : undefined,
			query: req.query as Record<string, string>,
		});

		// Set status code
		res.status(response.statusCode);

		// Set headers
		Object.keys(response.headers).forEach((key) => {
			const value = response.headers[key];
			if (value) {
				res.setHeader(key, Array.isArray(value) ? value.join(", ") : String(value));
			}
		});

		// Send response body
		res.send(response.body);
	} catch (error) {
		console.error("Error handling request:", error);
		if (!res.headersSent) {
			res.status(500).json({
				success: false,
				error: process.env.NODE_ENV === "production" ? "Internal server error" : String(error),
			});
		}
	}
}
