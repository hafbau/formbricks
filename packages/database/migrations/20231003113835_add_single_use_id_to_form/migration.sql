/*
  Warnings:

  - A unique constraint covering the columns `[formId,singleUseId]` on the table `Response` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "singleUseId" TEXT;

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "singleUse" JSONB DEFAULT '{"enabled": false, "isEncrypted": true}';

-- CreateIndex
CREATE UNIQUE INDEX "Response_formId_singleUseId_key" ON "Response"("formId", "singleUseId");
