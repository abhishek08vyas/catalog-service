import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Product } from "./Product";

@Entity("product_attributes")
export class ProductAttribute {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "int", name: "product_id" })
	productId!: number;

	@ManyToOne(() => Product, (product: { attributes: ProductAttribute[] }) => product.attributes)
	@JoinColumn({ name: "product_id" })
	product!: Product;

	@Column({ type: "varchar", length: 100, name: "attribute_name" })
	attributeName!: string;

	@Column({ type: "text", name: "attribute_value" })
	attributeValue!: string;

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;
}
