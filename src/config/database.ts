import "reflect-metadata";
import { DataSource } from "typeorm";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { ProductImage } from "../models/ProductImage";
import { ProductAttribute } from "../models/ProductAttribute";

import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV !== "test") {
	console.warn(`Warning: Missing environment variables: ${missingVars.join(", ")}. ` + "Using individual DB connection parameters if available.");
}

// Determine database connection configuration
const isProduction = process.env.NODE_ENV === "production";
const useUrl = !!process.env.DATABASE_URL;

// For Vercel/serverless: prefer DATABASE_URL, fallback to individual params
const databaseConfig = useUrl
	? {
			type: "postgres" as const,
			url: process.env.DATABASE_URL,
			ssl: isProduction
				? {
						rejectUnauthorized: false,
				  }
				: false,
	  }
	: {
			type: "postgres" as const,
			host: process.env.DB_HOST || "localhost",
			port: parseInt(process.env.DB_PORT || "5432", 10),
			username: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			ssl: isProduction
				? {
						rejectUnauthorized: false,
				  }
				: false,
	  };

export const AppDataSource = new DataSource({
	...databaseConfig,
	// NEVER use synchronize in production - it's a security risk
	synchronize: process.env.NODE_ENV !== "production" && process.env.DB_SYNC === "true",
	logging: process.env.NODE_ENV === "development",
	entities: [Category, Product, ProductImage, ProductAttribute],
	migrations: [],
	subscribers: [],
	// Connection pool settings for serverless
	extra: {
		connectionLimit: 10,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 10000,
	},
});
