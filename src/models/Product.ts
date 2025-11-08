import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Category } from "./Category";
import { ProductImage } from "./ProductImage";
import { ProductAttribute } from "./ProductAttribute";

@Entity("products")
export class Product {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 100, unique: true })
	sku!: string;

	@Column({ type: "varchar", length: 255 })
	name!: string;

	@Column({ type: "varchar", length: 255, unique: true })
	slug!: string;

	@Column({ type: "text", nullable: true })
	description!: string | null;

	@Column({ type: "int", name: "category_id" })
	categoryId!: number;

	@ManyToOne(() => Category, (category) => category.products, { onDelete: "RESTRICT" })
	@JoinColumn({ name: "category_id" })
	category!: Category;

	@Column({ type: "decimal", precision: 12, scale: 2, name: "base_price" })
	basePrice!: number;

	@Column({ type: "varchar", length: 3, default: "USD" })
	currency!: string;

	@Column({ type: "int", default: 0, name: "stock_quantity" })
	stockQuantity!: number;

	@Column({ type: "int", default: 1, name: "min_order_quantity" })
	minOrderQuantity!: number;

	@Column({ type: "boolean", default: true, name: "is_active" })
	isActive!: boolean;

	@OneToMany(() => ProductImage, (image) => image.product)
	images!: ProductImage[];

	@OneToMany(() => ProductAttribute, (attribute) => attribute.product)
	attributes!: ProductAttribute[];

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
