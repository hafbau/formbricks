/*
  Warnings:

  - You are about to drop the column `inAppFormBranding` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `linkFormBranding` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Form" RENAME CONSTRAINT "form_pkey" TO "Form_pkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "inAppFormBranding",
DROP COLUMN "linkFormBranding",
ADD COLUMN     "inAppFormBranding" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "linkFormBranding" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "billing" SET DEFAULT '{"stripeCustomerId": null, "features": {"inAppform": {"status": "inactive", "unlimited": false}, "linkForm": {"status": "inactive", "unlimited": false}, "userTargeting": {"status": "inactive", "unlimited": false}}}';

-- RenameForeignKey
ALTER TABLE "Form" RENAME CONSTRAINT "form_environmentId_fkey" TO "Form_environmentId_fkey";

-- RenameIndex
ALTER INDEX "form_environmentId_idx" RENAME TO "Form_environmentId_idx";
