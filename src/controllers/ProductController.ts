import { FastifyRequest, FastifyReply } from "fastify";
import { AppDataSource } from "../config/database";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

export class ProductController {
	private getRepository() {
		return AppDataSource.getRepository(Product);
	}

	private getCategoryRepository() {
		return AppDataSource.getRepository(Category);
	}

	async getAll(req: FastifyRequest, reply: FastifyReply) {
		try {
			const productRepository = this.getRepository();
			const products = await productRepository.find({
				relations: ["category", "images", "attributes"],
				order: { createdAt: "DESC" },
			});
			return reply.send({ success: true, data: products });
		} catch (error) {
			req.log.error(error, "Error fetching products");
			throw error;
		}
	}

	async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const productId = parseInt(req.params.id, 10);
			if (isNaN(productId)) {
				return reply.status(400).send({ success: false, error: "Invalid product ID" });
			}

			const productRepository = this.getRepository();
			const product = await productRepository.findOne({
				where: { id: productId },
				relations: ["category", "images", "attributes"],
			});

			if (!product) {
				return reply.status(404).send({ success: false, error: "Product not found" });
			}

			return reply.send({ success: true, data: product });
		} catch (error) {
			req.log.error(error, "Error fetching product");
			throw error;
		}
	}

	async create(req: FastifyRequest<{ Body: Partial<Product> }>, reply: FastifyReply) {
		try {
			const productRepository = this.getRepository();
			const categoryRepository = this.getCategoryRepository();

			// Validate category exists
			if (req.body.categoryId) {
				const category = await categoryRepository.findOne({ where: { id: req.body.categoryId } });
				if (!category) {
					return reply.status(400).send({ success: false, error: "Category not found" });
				}
			}

			// Check if SKU or slug already exists
			if (req.body.sku) {
				const existingSku = await productRepository.findOne({ where: { sku: req.body.sku } });
				if (existingSku) {
					return reply.status(409).send({ success: false, error: "Product with this SKU already exists" });
				}
			}

			if (req.body.slug) {
				const existingSlug = await productRepository.findOne({ where: { slug: req.body.slug } });
				if (existingSlug) {
					return reply.status(409).send({ success: false, error: "Product with this slug already exists" });
				}
			}

			const product = productRepository.create(req.body);
			const saved = await productRepository.save(product);
			return reply.status(201).send({ success: true, data: saved });
		} catch (error: any) {
			req.log.error(error, "Error creating product");

			if (error.code === "23505") {
				return reply.status(409).send({ success: false, error: "Product with this SKU or slug already exists" });
			}

			if (error.code === "23503") {
				return reply.status(400).send({ success: false, error: "Invalid category reference" });
			}

			throw error;
		}
	}

	async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Product> }>, reply: FastifyReply) {
		try {
			const productId = parseInt(req.params.id, 10);
			if (isNaN(productId)) {
				return reply.status(400).send({ success: false, error: "Invalid product ID" });
			}

			const productRepository = this.getRepository();
			const categoryRepository = this.getCategoryRepository();

			const product = await productRepository.findOne({ where: { id: productId } });

			if (!product) {
				return reply.status(404).send({ success: false, error: "Product not found" });
			}

			// Validate category if being updated
			if (req.body.categoryId && req.body.categoryId !== product.categoryId) {
				const category = await categoryRepository.findOne({ where: { id: req.body.categoryId } });
				if (!category) {
					return reply.status(400).send({ success: false, error: "Category not found" });
				}
			}

			// Check if SKU is being updated and already exists
			if (req.body.sku && req.body.sku !== product.sku) {
				const existingSku = await productRepository.findOne({ where: { sku: req.body.sku } });
				if (existingSku) {
					return reply.status(409).send({ success: false, error: "Product with this SKU already exists" });
				}
			}

			// Check if slug is being updated and already exists
			if (req.body.slug && req.body.slug !== product.slug) {
				const existingSlug = await productRepository.findOne({ where: { slug: req.body.slug } });
				if (existingSlug) {
					return reply.status(409).send({ success: false, error: "Product with this slug already exists" });
				}
			}

			productRepository.merge(product, req.body);
			const updated = await productRepository.save(product);
			return reply.send({ success: true, data: updated });
		} catch (error: any) {
			req.log.error(error, "Error updating product");

			if (error.code === "23505") {
				return reply.status(409).send({ success: false, error: "Product with this SKU or slug already exists" });
			}

			if (error.code === "23503") {
				return reply.status(400).send({ success: false, error: "Invalid category reference" });
			}

			throw error;
		}
	}

	async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const productId = parseInt(req.params.id, 10);
			if (isNaN(productId)) {
				return reply.status(400).send({ success: false, error: "Invalid product ID" });
			}

			const productRepository = this.getRepository();
			const result = await productRepository.delete(productId);

			if (result.affected === 0) {
				return reply.status(404).send({ success: false, error: "Product not found" });
			}

			return reply.send({ success: true, message: "Product deleted successfully" });
		} catch (error: any) {
			req.log.error(error, "Error deleting product");

			if (error.code === "23503") {
				return reply.status(409).send({
					success: false,
					error: "Cannot delete product due to existing references",
				});
			}

			throw error;
		}
	}
}
