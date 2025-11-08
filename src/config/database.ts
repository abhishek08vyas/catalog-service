import "reflect-metadata";
import { DataSource } from "typeorm";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { ProductImage } from "../models/ProductImage";
import { ProductAttribute } from "../models/ProductAttribute";

import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
	type: "postgres",
	url: process.env.DATABASE_URL,
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || "5432"),
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	synchronize: true,
	logging: false,
	entities: [Category, Product, ProductImage, ProductAttribute],
	migrations: [],
	subscribers: [],
});
