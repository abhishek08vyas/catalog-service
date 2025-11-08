import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/ProductController";
import { createProductSchema, updateProductSchema, getProductByIdSchema, deleteProductSchema } from "../schemas/productSchema";

export async function productRoutes(fastify: FastifyInstance) {
	const controller = new ProductController();

	fastify.get(
		"/products",
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

	fastify.get("/products/:id", { schema: getProductByIdSchema }, controller.getById.bind(controller));

	fastify.post("/products", { schema: createProductSchema }, controller.create.bind(controller));

	fastify.put("/products/:id", { schema: updateProductSchema }, controller.update.bind(controller));

	fastify.delete("/products/:id", { schema: deleteProductSchema }, controller.delete.bind(controller));
}
