-- DropForeignKey
ALTER TABLE "Meal" DROP CONSTRAINT "Meal_menuId_fkey";

-- DropForeignKey
ALTER TABLE "MealItem" DROP CONSTRAINT "MealItem_menuId_mealType_fkey";

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_menuId_mealType_fkey" FOREIGN KEY ("menuId", "mealType") REFERENCES "Meal"("menuId", "type") ON DELETE CASCADE ON UPDATE CASCADE;
