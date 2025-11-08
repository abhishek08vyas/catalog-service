import { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/ProductController";

export async function productRoutes(fastify: FastifyInstance) {
	const controller = new ProductController();

	fastify.get("/products", controller.getAll);
	fastify.get("/products/:id", controller.getById);
	fastify.post("/products", controller.create);
	fastify.put("/products/:id", controller.update);
	fastify.delete("/products/:id", controller.delete);
}
