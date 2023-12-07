-- CreateEnum
CREATE TYPE "formAttributeFilterCondition" AS ENUM ('equals', 'notEquals');

-- CreateTable
CREATE TABLE "formAttributeFilter" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "attributeClassId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "condition" "formAttributeFilterCondition" NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "formAttributeFilter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "formAttributeFilter_formId_attributeClassId_key" ON "formAttributeFilter"("formId", "attributeClassId");

-- AddForeignKey
ALTER TABLE "formAttributeFilter" ADD CONSTRAINT "formAttributeFilter_attributeClassId_fkey" FOREIGN KEY ("attributeClassId") REFERENCES "AttributeClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formAttributeFilter" ADD CONSTRAINT "formAttributeFilter_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
