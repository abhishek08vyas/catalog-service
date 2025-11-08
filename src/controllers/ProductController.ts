import { FastifyRequest, FastifyReply } from "fastify";
import { AppDataSource } from "../config/database";
import { Product } from "../models/Product";

const productRepository = AppDataSource.getRepository(Product);

export class ProductController {
	async getAll(req: FastifyRequest, reply: FastifyReply) {
		try {
			const products = await productRepository.find({
				relations: ["category", "images", "attributes"],
			});
			return reply.send({ success: true, data: products });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to fetch products" });
		}
	}

	async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const product = await productRepository.findOne({
				where: { id: parseInt(req.params.id) },
				relations: ["category", "images", "attributes"],
			});
			if (!product) {
				return reply.status(404).send({ success: false, error: "Product not found" });
			}
			return reply.send({ success: true, data: product });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to fetch product" });
		}
	}

	async create(req: FastifyRequest<{ Body: Partial<Product> }>, reply: FastifyReply) {
		try {
			const product = productRepository.create(req.body);
			const saved = await productRepository.save(product);
			return reply.status(201).send({ success: true, data: saved });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to create product" });
		}
	}

	async update(req: FastifyRequest<{ Params: { id: string }; Body: Partial<Product> }>, reply: FastifyReply) {
		try {
			const product = await productRepository.findOne({ where: { id: parseInt(req.params.id) } });
			if (!product) {
				return reply.status(404).send({ success: false, error: "Product not found" });
			}
			productRepository.merge(product, req.body);
			const updated = await productRepository.save(product);
			return reply.send({ success: true, data: updated });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to update product" });
		}
	}

	async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
		try {
			const result = await productRepository.delete(parseInt(req.params.id));
			if (result.affected === 0) {
				return reply.status(404).send({ success: false, error: "Product not found" });
			}
			return reply.send({ success: true, message: "Product deleted" });
		} catch (error) {
			return reply.status(500).send({ success: false, error: "Failed to delete product" });
		}
	}
}
