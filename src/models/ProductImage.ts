import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Product } from "./Product";

@Entity("product_images")
export class ProductImage {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "int", name: "product_id" })
	productId!: number;

	@ManyToOne(() => Product, (product) => product.images)
	@JoinColumn({ name: "product_id" })
	product!: Product;

	@Column({ type: "varchar", length: 500, name: "image_url" })
	imageUrl!: string;

	@Column({ type: "int", default: 0, name: "display_order" })
	displayOrder!: number;

	@Column({ type: "boolean", default: false, name: "is_primary" })
	isPrimary!: boolean;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;
}
