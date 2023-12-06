-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "hiddenFields" JSONB NOT NULL DEFAULT '{"enabled": false}';
