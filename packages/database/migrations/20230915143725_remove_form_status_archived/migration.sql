/*
  Warnings:

  - The values [archived] on the enum `FormStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FormStatus_new" AS ENUM ('draft', 'inProgress', 'paused', 'completed');
ALTER TABLE "Form" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Form" ALTER COLUMN "status" TYPE "FormStatus_new" USING ("status"::text::"FormStatus_new");
ALTER TYPE "FormStatus" RENAME TO "FormStatus_old";
ALTER TYPE "FormStatus_new" RENAME TO "FormStatus";
DROP TYPE "FormStatus_old";
ALTER TABLE "Form" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;
