/*
  Warnings:

  - Added the required column `date` to the `Food` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Food` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
