-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "effectivePrice" INTEGER NOT NULL DEFAULT 0;

-- Backfill effectivePrice = round(price * (100 - discount) / 100)
UPDATE "Product"
SET "effectivePrice" = ROUND("price"::numeric * (100 - "discount") / 100.0);

-- CreateTable
CREATE TABLE "RecentSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecentSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentlyViewedProduct" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyViewedProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentSearch_userId_updatedAt_idx" ON "RecentSearch"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecentSearch_userId_query_key" ON "RecentSearch"("userId", "query");

-- CreateIndex
CREATE INDEX "RecentlyViewedProduct_userId_viewedAt_idx" ON "RecentlyViewedProduct"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecentlyViewedProduct_userId_productId_key" ON "RecentlyViewedProduct"("userId", "productId");

-- CreateIndex
CREATE INDEX "Product_effectivePrice_idx" ON "Product"("effectivePrice");

-- CreateIndex
CREATE INDEX "Product_discount_idx" ON "Product"("discount");

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewedProduct" ADD CONSTRAINT "RecentlyViewedProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentlyViewedProduct" ADD CONSTRAINT "RecentlyViewedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
