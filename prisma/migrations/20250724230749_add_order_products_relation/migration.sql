-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "companyProfit" DECIMAL(65,30),
ADD COLUMN     "photographerFee" DECIMAL(65,30),
ADD COLUMN     "totalAmount" DECIMAL(65,30),
ADD COLUMN     "vatAmount" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OrderProduct" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderProduct_orderId_idx" ON "OrderProduct"("orderId");

-- CreateIndex
CREATE INDEX "OrderProduct_productId_idx" ON "OrderProduct"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderProduct_orderId_productId_key" ON "OrderProduct"("orderId", "productId");

-- CreateIndex
CREATE INDEX "Product_companyId_isActive_category_idx" ON "Product"("companyId", "isActive", "category");

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
