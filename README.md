# Catalog Service

A RESTful API service for managing products and categories built with Fastify, TypeORM, and PostgreSQL.

## Features

-   ✅ Product and Category Management
-   ✅ Hierarchical Categories (parent-child relationships)
-   ✅ Product Images and Attributes
-   ✅ RESTful API with CRUD operations
-   ✅ PostgreSQL database with TypeORM
-   ✅ MVC Architecture
-   ✅ CORS enabled
-   ✅ TypeScript support
-   ✅ Vercel deployment ready

## Tech Stack

-   **Framework**: Fastify
-   **Database**: PostgreSQL
-   **ORM**: TypeORM
-   **Language**: TypeScript
-   **Deployment**: Vercel

## Project Structure

```
catalog-service/
├── api/
│   └── index.ts                # Vercel Route File
├── src/
│   ├── config/
│   │   └── database.ts      # Database configuration
│   ├── models/
│   │   ├── Category.ts         # Category entity
│   │   ├── Product.ts          # Product entity
│   │   ├── ProductImage.ts     # Product images entity
│   │   └── ProductAttribute.ts # Product attributes entity
│   ├── controllers/
│   │   ├── CategoryController.ts
│   │   └── ProductController.ts
│   ├── routes/
│   │   ├── categoryRoutes.ts
│   │   └── productRoutes.ts
│   └── index.ts                # Main application file
│   └── app.ts                  # Init Server
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## Setup

### Prerequisites

-   Node.js (v18 or higher)
-   PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/abhishek08vyas/catalog-service.git
cd catalog-service
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/commerce_platform
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASS=password
DB_NAME=commerce_platform
```

5. Run the development server:

```bash
npm run dev
```

## API Endpoints

### Categories

-   `GET /api/v1/categories` - Get all categories
-   `GET /api/v1/categories/:id` - Get category by ID
-   `POST /api/v1/categories` - Create new category
-   `PUT /api/v1/categories/:id` - Update category
-   `DELETE /api/v1/categories/:id` - Delete category

**Category Schema:**

```json
{
	"name": "Electronics",
	"slug": "electronics",
	"parentId": null,
	"description": "Electronic products",
	"imageUrl": "https://example.com/electronics.jpg",
	"isActive": true,
	"displayOrder": 0
}
```

### Products

-   `GET /api/v1/products` - Get all products
-   `GET /api/v1/products/:id` - Get product by ID
-   `POST /api/v1/products` - Create new product
-   `PUT /api/v1/products/:id` - Update product
-   `DELETE /api/v1/products/:id` - Delete product

**Product Schema:**

```json
{
	"sku": "LAP-001",
	"name": "Laptop",
	"slug": "laptop",
	"description": "High-performance laptop",
	"categoryId": 1,
	"basePrice": 999.99,
	"currency": "USD",
	"stockQuantity": 50,
	"minOrderQuantity": 1,
	"isActive": true
}
```

## Scripts

-   `npm run dev` - Start development server with hot reload
-   `npm run build` - Build for production
-   `npm start` - Start production server

## Vercel Deployment

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Build the project:

```bash
npm run build
```

3. Deploy:

```bash
vercel
```

4. Set environment variables in Vercel Dashboard:
    - Go to your project settings
    - Add all environment variables from `.env`
    - Redeploy

## Database Schema

### Categories Table

-   `id` (SERIAL, Primary Key)
-   `name` (VARCHAR(255))
-   `slug` (VARCHAR(255), unique)
-   `parent_id` (INTEGER, Foreign Key to categories)
-   `description` (TEXT, nullable)
-   `image_url` (VARCHAR(500), nullable)
-   `is_active` (BOOLEAN, default: true)
-   `display_order` (INTEGER, default: 0)
-   `created_at` (TIMESTAMP)
-   `updated_at` (TIMESTAMP)

### Products Table

-   `id` (SERIAL, Primary Key)
-   `sku` (VARCHAR(100), unique)
-   `name` (VARCHAR(255))
-   `slug` (VARCHAR(255), unique)
-   `description` (TEXT, nullable)
-   `category_id` (INTEGER, Foreign Key)
-   `base_price` (NUMERIC(12,2))
-   `currency` (VARCHAR(3), default: 'USD')
-   `stock_quantity` (INTEGER, default: 0)
-   `min_order_quantity` (INTEGER, default: 1)
-   `is_active` (BOOLEAN, default: true)
-   `created_at` (TIMESTAMP)
-   `updated_at` (TIMESTAMP)

### Product Images Table

-   `id` (SERIAL, Primary Key)
-   `product_id` (INTEGER, Foreign Key)
-   `image_url` (VARCHAR(500))
-   `display_order` (INTEGER, default: 0)
-   `is_primary` (BOOLEAN, default: false)
-   `created_at` (TIMESTAMP)

### Product Attributes Table

-   `id` (SERIAL, Primary Key)
-   `product_id` (INTEGER, Foreign Key)
-   `attribute_name` (VARCHAR(100))
-   `attribute_value` (TEXT)
-   `created_at` (TIMESTAMP)

## License

MIT
