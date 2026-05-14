/*
  Warnings:

  - A unique constraint covering the columns `[user_id,product_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "fk_reviews_order";

-- DropIndex
DROP INDEX "reviews_order_id_key";

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "order_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_product_id_key" ON "reviews"("user_id", "product_id");
