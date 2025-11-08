import { FastifyInstance } from "fastify";
import { CategoryController } from "../controllers/CategoryController";

export async function categoryRoutes(fastify: FastifyInstance) {
	const controller = new CategoryController();

	fastify.get("/categories", controller.getAll);
	fastify.get("/categories/:id", controller.getById);
	fastify.post("/categories", controller.create);
	fastify.put("/categories/:id", controller.update);
	fastify.delete("/categories/:id", controller.delete);
}
