/*
  Warnings:

  - Added the required column `foodId` to the `MealItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealItem" ADD COLUMN     "foodId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Food" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Food_name_key" ON "Food"("name");

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
