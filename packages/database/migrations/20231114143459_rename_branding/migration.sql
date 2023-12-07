/*
  Warnings:

  - You are about to drop the column `fastformSignature` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" RENAME COLUMN "fastformSignature" TO "linkSurveyBranding";
ALTER TABLE "Product" ADD COLUMN "inAppSurveyBranding" BOOLEAN NOT NULL DEFAULT true;
