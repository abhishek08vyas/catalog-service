import { FastifySchema } from "fastify";

export const createCategorySchema: FastifySchema = {
	body: {
		type: "object",
		required: ["name", "slug"],
		properties: {
			name: { type: "string", minLength: 1, maxLength: 255 },
			slug: { type: "string", minLength: 1, maxLength: 255, pattern: "^[a-z0-9-]+$" },
			parentId: { type: ["integer", "null"] },
			description: { type: ["string", "null"], maxLength: 5000 },
			imageUrl: { type: ["string", "null"], format: "uri", maxLength: 500 },
			isActive: { type: "boolean", default: true },
			displayOrder: { type: "integer", default: 0, minimum: 0 },
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

export const updateCategorySchema: FastifySchema = {
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
			name: { type: "string", minLength: 1, maxLength: 255 },
			slug: { type: "string", minLength: 1, maxLength: 255, pattern: "^[a-z0-9-]+$" },
			parentId: { type: ["integer", "null"] },
			description: { type: ["string", "null"], maxLength: 5000 },
			imageUrl: { type: ["string", "null"], format: "uri", maxLength: 500 },
			isActive: { type: "boolean" },
			displayOrder: { type: "integer", minimum: 0 },
		},
	},
};

export const getCategoryByIdSchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", pattern: "^[0-9]+$" },
		},
		required: ["id"],
	},
};

export const deleteCategorySchema: FastifySchema = {
	params: {
		type: "object",
		properties: {
			id: { type: "string", pattern: "^[0-9]+$" },
		},
		required: ["id"],
	},
};
