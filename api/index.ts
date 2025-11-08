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

		// Prepare headers - normalize and remove Content-Length to let Fastify calculate it correctly
		// This prevents "Request body size did not match Content-Length" errors
		const headers: Record<string, string> = {};
		for (const [key, value] of Object.entries(req.headers)) {
			if (value !== undefined) {
				// Skip Content-Length header - let Fastify calculate it from the actual payload
				// This is crucial because Vercel may have already parsed the body,
				// causing a size mismatch when we stringify it again
				if (key.toLowerCase() === "content-length") {
					continue;
				}
				// Handle array values (some headers can be arrays)
				headers[key] = Array.isArray(value) ? value.join(", ") : String(value);
			}
		}

		// Prepare payload
		let payload: string | Buffer | undefined;
		if (req.body) {
			if (typeof req.body === "string") {
				payload = req.body;
			} else if (Buffer.isBuffer(req.body)) {
				payload = req.body;
			} else {
				// Vercel has already parsed JSON, so stringify it
				payload = JSON.stringify(req.body);
				// Set Content-Type to application/json if not already set
				const hasContentType = Object.keys(headers).some(
					(key) => key.toLowerCase() === "content-type"
				);
				if (!hasContentType) {
					headers["content-type"] = "application/json";
				}
			}
		}

		// Use Fastify's inject method - perfect for serverless environments
		// This bypasses the HTTP server layer and directly processes requests
		const response = await fastifyApp.inject({
			method: req.method || "GET",
			url: req.url || "/",
			headers,
			payload,
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
