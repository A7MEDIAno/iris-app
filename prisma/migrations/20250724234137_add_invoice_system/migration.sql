/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dueDate` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "paidDate" TIMESTAMP(3),
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "vatAmount" DECIMAL(65,30) NOT NULL,
ALTER COLUMN "total" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "availableTo" TIMESTAMP(3),
ADD COLUMN     "calendarUrl" TEXT,
ADD COLUMN     "equipment" TEXT[],
ADD COLUMN     "hourlyRate" DECIMAL(65,30),
ADD COLUMN     "specialties" TEXT[],
ADD COLUMN     "workingAreas" TEXT[];

-- CreateTable
CREATE TABLE "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "vatRate" DECIMAL(65,30) NOT NULL DEFAULT 25,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceLine_invoiceId_idx" ON "InvoiceLine"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "Invoice"("customerId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
