import { FastifyRequest, FastifyReply } from "fastify";
import { AppDataSource } from "../config/database";
import { Category } from "../models/Category";

const categoryRepository = AppDataSource.getRepository(Category);

export class CategoryController {
	async getAll(req: FastifyRequest, reply: FastifyReply) {
		try {
			const categories = await categoryRepository.find({
				relations: ["products", "parent", "children"],
				order: { displayOrder: "ASC" },
			});
			return reply.send({ success: true, data: categories });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to fetch categories" });
		}
	}

	async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const category = await categoryRepository.findOne({
				where: { id: parseInt(req.params.id) },
				relations: ["products", "parent", "children"],
			});
			if (!category) {
				return reply.status(404).send({ success: false, error: "Category not found" });
			}
			return reply.send({ success: true, data: category });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to fetch category" });
		}
	}

	async create(req: FastifyRequest<{ Body: Partial<Category> }>, reply: FastifyReply) {
		try {
			const category = categoryRepository.create(req.body);
			const saved = await categoryRepository.save(category);
			return reply.status(201).send({ success: true, data: saved });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to create category" });
		}
	}

	async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Category> }>, reply: FastifyReply) {
		try {
			const category = await categoryRepository.findOne({ where: { id: parseInt(req.params.id) } });
			if (!category) {
				return reply.status(404).send({ success: false, error: "Category not found" });
			}
			categoryRepository.merge(category, req.body);
			const updated = await categoryRepository.save(category);
			return reply.send({ success: true, data: updated });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to update category" });
		}
	}

	async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const result = await categoryRepository.delete(parseInt(req.params.id));
			if (result.affected === 0) {
				return reply.status(404).send({ success: false, error: "Category not found" });
			}
			return reply.send({ success: true, message: "Category deleted" });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to delete category" });
		}
	}
}
