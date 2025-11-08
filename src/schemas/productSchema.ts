import { FastifySchema } from "fastify";

export const createProductSchema: FastifySchema = {
	body: {
		type: "object",
		required: ["sku", "name", "slug", "categoryId", "basePrice"],
		properties: {
			sku: { type: "string", minLength: 1, maxLength: 100 },
			name: { type: "string", minLength: 1, maxLength: 255 },
			slug: { type: "string", minLength: 1, maxLength: 255, pattern: "^[a-z0-9-]+$" },
			description: { type: ["string", "null"], maxLength: 10000 },
			categoryId: { type: "integer", minimum: 1 },
			basePrice: { type: "number", minimum: 0, multipleOf: 0.01 },
			currency: { type: "string", pattern: "^[A-Z]{3}$", default: "USD" },
			stockQuantity: { type: "integer", minimum: 0, default: 0 },
			minOrderQuantity: { type: "integer", minimum: 1, default: 1 },
			isActive: { type: "boolean", default: true },
		},
	},
	response: {
		201: {
			type: "object",
			properties: {
				success: { type: "boolean" },
				data: { type: "object" },
			},
		},
	},
};

export const updateProductSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", pattern: "^[0-9]+$" },
		},
		required: ["id"],
	},
	body: {
		type: "object",
		properties: {
			sku: { type: "string", minLength: 1, maxLength: 100 },
			name: { type: "string", minLength: 1, maxLength: 255 },
			slug: { type: "string", minLength: 1, maxLength: 255, pattern: "^[a-z0-9-]+$" },
			description: { type: ["string", "null"], maxLength: 10000 },
			categoryId: { type: "integer", minimum: 1 },
			basePrice: { type: "number", minimum: 0, multipleOf: 0.01 },
			currency: { type: "string", pattern: "^[A-Z]{3}$" },
			stockQuantity: { type: "integer", minimum: 0 },
			minOrderQuantity: { type: "integer", minimum: 1 },
			isActive: { type: "boolean" },
		},
	},
};

export const getProductByIdSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", pattern: "^[0-9]+$" },
		},
		required: ["id"],
	},
};

export const deleteProductSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", pattern: "^[0-9]+$" },
		},
		required: ["id"],
	},
};
