import { FastifyInstance } from "fastify";
import { CategoryController } from "../controllers/CategoryController";
import { createCategorySchema, updateCategorySchema, getCategoryByIdSchema, deleteCategorySchema } from "../schemas/categorySchema";

export async function categoryRoutes(fastify: FastifyInstance) {
	const controller = new CategoryController();

	fastify.get(
		"/categories",
		{
			schema: {
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							data: { type: "array" },
						},
					},
				},
			},
		},
		controller.getAll.bind(controller),
	);

	fastify.get("/categories/:id", { schema: getCategoryByIdSchema }, controller.getById.bind(controller));

	fastify.post("/categories", { schema: createCategorySchema }, controller.create.bind(controller));

	fastify.put("/categories/:id", { schema: updateCategorySchema }, controller.update.bind(controller));

	fastify.delete("/categories/:id", { schema: deleteCategorySchema }, controller.delete.bind(controller));
}
