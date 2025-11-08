import { FastifyRequest, FastifyReply } from "fastify";
import { AppDataSource } from "../config/database";
import { Category } from "../models/Category";

export class CategoryController {
	private getRepository() {
		return AppDataSource.getRepository(Category);
	}

	async getAll(req: FastifyRequest, reply: FastifyReply) {
		try {
			const categoryRepository = this.getRepository();
			const categories = await categoryRepository.find({
				relations: ["products", "parent", "children"],
				order: { displayOrder: "ASC" },
			});
			return reply.send({ success: true, data: categories });
		} catch (error) {
			req.log.error(error, "Error fetching categories");
			throw error; // Let Fastify error handler deal with it
		}
	}

	async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const categoryId = parseInt(req.params.id, 10);
			if (isNaN(categoryId)) {
				return reply.status(400).send({ success: false, error: "Invalid category ID" });
			}

			const categoryRepository = this.getRepository();
			const category = await categoryRepository.findOne({
				where: { id: categoryId },
				relations: ["products", "parent", "children"],
			});

			if (!category) {
				return reply.status(404).send({ success: false, error: "Category not found" });
			}

			return reply.send({ success: true, data: category });
		} catch (error) {
			req.log.error(error, "Error fetching category");
			throw error;
		}
	}

	async create(req: FastifyRequest<{ Body: Partial<Category> }>, reply: FastifyReply) {
		try {
			const categoryRepository = this.getRepository();

			// Check if slug already exists
			if (req.body.slug) {
				const existing = await categoryRepository.findOne({ where: { slug: req.body.slug } });
				if (existing) {
					return reply.status(409).send({ success: false, error: "Category with this slug already exists" });
				}
			}

			const category = categoryRepository.create(req.body);
			const saved = await categoryRepository.save(category);
			return reply.status(201).send({ success: true, data: saved });
		} catch (error: any) {
			req.log.error(error, "Error creating category");

			// Handle unique constraint violations
			if (error.code === "23505") {
				return reply.status(409).send({ success: false, error: "Category with this slug or name already exists" });
			}

			throw error;
		}
	}

	async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Category> }>, reply: FastifyReply) {
		try {
			const categoryId = parseInt(req.params.id, 10);
			if (isNaN(categoryId)) {
				return reply.status(400).send({ success: false, error: "Invalid category ID" });
			}

			const categoryRepository = this.getRepository();
			const category = await categoryRepository.findOne({ where: { id: categoryId } });

			if (!category) {
				return reply.status(404).send({ success: false, error: "Category not found" });
			}

			// Check if slug is being updated and already exists
			if (req.body.slug && req.body.slug !== category.slug) {
				const existing = await categoryRepository.findOne({ where: { slug: req.body.slug } });
				if (existing) {
					return reply.status(409).send({ success: false, error: "Category with this slug already exists" });
				}
			}

			categoryRepository.merge(category, req.body);
			const updated = await categoryRepository.save(category);
			return reply.send({ success: true, data: updated });
		} catch (error: any) {
			req.log.error(error, "Error updating category");

			if (error.code === "23505") {
				return reply.status(409).send({ success: false, error: "Category with this slug or name already exists" });
			}

			throw error;
		}
	}

	async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const categoryId = parseInt(req.params.id, 10);
			if (isNaN(categoryId)) {
				return reply.status(400).send({ success: false, error: "Invalid category ID" });
			}

			const categoryRepository = this.getRepository();

			// Check if category has products
			const category = await categoryRepository.findOne({
				where: { id: categoryId },
				relations: ["products"],
			});

			if (!category) {
				return reply.status(404).send({ success: false, error: "Category not found" });
			}

			if (category.products && category.products.length > 0) {
				return reply.status(409).send({
					success: false,
					error: "Cannot delete category with associated products",
				});
			}

			const result = await categoryRepository.delete(categoryId);
			if (result.affected === 0) {
				return reply.status(404).send({ success: false, error: "Category not found" });
			}

			return reply.send({ success: true, message: "Category deleted successfully" });
		} catch (error: any) {
			req.log.error(error, "Error deleting category");

			// Handle foreign key constraint violations
			if (error.code === "23503") {
				return reply.status(409).send({
					success: false,
					error: "Cannot delete category due to existing references",
				});
			}

			throw error;
		}
	}
}
