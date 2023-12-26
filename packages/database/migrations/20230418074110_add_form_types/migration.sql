/*
  Warnings:

  - The `type` column on the `Form` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Form" DROP COLUMN "type",
ADD COLUMN     "type" "FormType" NOT NULL DEFAULT 'web';
