import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Product } from "./Product";

@Entity("categories")
export class Category {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ type: "varchar", length: 255 })
	name!: string;

	@Column({ type: "varchar", length: 255, unique: true })
	slug!: string;

	@Column({ type: "int", nullable: true, name: "parent_id" })
	parentId!: number | null;

	@ManyToOne(() => Category, (category) => category.children, { nullable: true })
	@JoinColumn({ name: "parent_id" })
	parent!: Category | null;

	@OneToMany(() => Category, (category) => category.parent)
	children!: Category[];

	@Column({ type: "text", nullable: true })
	description!: string | null;

	@Column({ type: "varchar", length: 500, nullable: true, name: "image_url" })
	imageUrl!: string | null;

	@Column({ type: "boolean", default: true, name: "is_active" })
	isActive!: boolean;

	@Column({ type: "int", default: 0, name: "display_order" })
	displayOrder!: number;

	@OneToMany(() => Product, (product) => product.category)
	products!: Product[];

	@CreateDateColumn({ name: "created_at" })
	createdAt!: Date;

	@UpdateDateColumn({ name: "updated_at" })
	updatedAt!: Date;
}
