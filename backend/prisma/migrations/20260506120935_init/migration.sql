CREATE EXTENSION IF NOT EXISTS vector;
-- CreateTable
CREATE TABLE "roles" (
    "role_id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "address_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "rec_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "face_shape" TEXT,
    "confidence" DECIMAL(3,2),
    "recom_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("rec_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" BIGSERIAL NOT NULL,
    "admin_id" BIGINT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "action_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "post_id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "image" TEXT,
    "author" TEXT NOT NULL,
    "category" TEXT,
    "read_time" TEXT,
    "is_published" BOOLEAN DEFAULT true,
    "published_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "brands" (
    "brand_id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("brand_id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "cart_item_id" BIGSERIAL NOT NULL,
    "cart_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "variant_id" BIGINT,
    "quantity" INTEGER DEFAULT 1,
    "prescription_data" JSONB,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("cart_item_id")
);

-- CreateTable
CREATE TABLE "carts" (
    "carts_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("carts_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "embeddings" (
    "id" BIGSERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_images" (
    "image_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "image_data" BYTEA NOT NULL,
    "uploaded_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "face_images_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "feedback_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "comment" TEXT,
    "feedback_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("feedback_id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "version" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applied_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notif_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT,
    "sent_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notif_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "address_id" BIGINT NOT NULL,
    "order_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT DEFAULT 'pending',
    "discount_from_points" DECIMAL(10,2) DEFAULT 0,
    "points_redeemed" INTEGER DEFAULT 0,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "orders_items" (
    "order_item_id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,
    "variant_id" BIGINT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) DEFAULT 0,
    "total_price" DECIMAL(10,2) DEFAULT 0,
    "prescription_data" JSONB,

    CONSTRAINT "orders_items_pkey" PRIMARY KEY ("order_item_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "payment_meth" TEXT,
    "transaction_id" BIGINT,
    "status" TEXT DEFAULT 'pending',
    "gateway_response" JSONB,
    "paid_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "prescription_inventory" (
    "prescription_id" BIGSERIAL NOT NULL,
    "variant_id" BIGINT NOT NULL,
    "sphere" DECIMAL(4,2),
    "cylinder" DECIMAL(4,2),
    "axis" INTEGER,
    "pupillary_distance" INTEGER,
    "stock_quantity" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_inventory_pkey" PRIMARY KEY ("prescription_id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "variant_id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "sku" TEXT NOT NULL,
    "color_name" TEXT,
    "color_hex" TEXT,
    "size" TEXT,
    "price_adjustment" DECIMAL(10,2) DEFAULT 0,
    "stock_quantity" INTEGER DEFAULT 0,
    "low_stock_alert" INTEGER DEFAULT 5,
    "images" TEXT[],
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "compare_price" DECIMAL(10,2),
    "category_id" BIGINT NOT NULL,
    "brand_id" BIGINT NOT NULL,
    "frame_shape" TEXT,
    "face_shape" TEXT,
    "gender" TEXT,
    "material" TEXT,
    "prescription_ready" BOOLEAN DEFAULT false,
    "virtual_try_on" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "is_bundle" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "base_curve" DOUBLE PRECISION,
    "bridge_width" DOUBLE PRECISION,
    "details" TEXT,
    "diameter" DOUBLE PRECISION,
    "lens_width" DOUBLE PRECISION,
    "temple_length" DOUBLE PRECISION,
    "water_content" DOUBLE PRECISION,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "reports" (
    "report_id" BIGSERIAL NOT NULL,
    "report_data" JSONB,
    "generated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "session_token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "google_id" TEXT,
    "facebook_id" TEXT,
    "loyalty_points" INTEGER DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "role_id" BIGINT DEFAULT 3,
    "reset_token" TEXT,
    "reset_token_expires" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "wishlist_items" (
    "wishlist_items_id" BIGSERIAL NOT NULL,
    "wishlist_id" BIGINT NOT NULL,
    "product_id" BIGINT NOT NULL,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("wishlist_items_id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "wishlist_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("wishlist_id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "message_id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "transaction_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "order_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "review_id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "status" VARCHAR DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "product_id" BIGINT,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "idx_addresses_user" ON "addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE INDEX "idx_ai_rec_product" ON "ai_recommendations"("product_id");

-- CreateIndex
CREATE INDEX "idx_ai_rec_user" ON "ai_recommendations"("user_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_admin" ON "audit_logs"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "idx_blog_slug" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "idx_cart_items_cart" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "idx_cart_items_product" ON "cart_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_id_key" ON "cart_items"("cart_id", "product_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE INDEX "idx_face_images_user" ON "face_images"("user_id");

-- CreateIndex
CREATE INDEX "idx_feedback_product" ON "feedback"("product_id");

-- CreateIndex
CREATE INDEX "idx_feedback_user" ON "feedback"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_orders_address" ON "orders"("address_id");

-- CreateIndex
CREATE INDEX "idx_orders_user" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "idx_orders_items_order" ON "orders_items"("order_id");

-- CreateIndex
CREATE INDEX "idx_orders_items_product" ON "orders_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "idx_prescription_variant" ON "prescription_inventory"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "prescription_inventory_variant_id_sphere_cylinder_axis_pupi_key" ON "prescription_inventory"("variant_id", "sphere", "cylinder", "axis", "pupillary_distance");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "idx_variants_product" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "idx_variants_sku" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "idx_products_brand" ON "products"("brand_id");

-- CreateIndex
CREATE INDEX "idx_products_category" ON "products"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "idx_sessions_user" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_id_key" ON "users"("facebook_id");

-- CreateIndex
CREATE INDEX "idx_wishlist_items_product" ON "wishlist_items"("product_id");

-- CreateIndex
CREATE INDEX "idx_wishlist_items_wishlist" ON "wishlist_items"("wishlist_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_items_wishlist_id_product_id_key" ON "wishlist_items"("wishlist_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_id_key" ON "wishlists"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");

-- CreateIndex
CREATE INDEX "idx_reviews_user" ON "reviews"("user_id");

-- CreateIndex
CREATE INDEX "idx_reviews_product" ON "reviews"("product_id");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("admin_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("carts_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "face_images" ADD CONSTRAINT "face_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescription_inventory" ADD CONSTRAINT "prescription_inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("variant_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("brand_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_fkey" FOREIGN KEY ("wishlist_id") REFERENCES "wishlists"("wishlist_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_order" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_product" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "fk_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;
