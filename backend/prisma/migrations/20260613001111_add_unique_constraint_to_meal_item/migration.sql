/*
  Warnings:

  - A unique constraint covering the columns `[menuId,mealType,foodId]` on the table `MealItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MealItem_menuId_mealType_foodId_key" ON "MealItem"("menuId", "mealType", "foodId");
