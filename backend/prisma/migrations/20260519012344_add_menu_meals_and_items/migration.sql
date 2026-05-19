-- CreateEnum
CREATE TYPE "MealTypes" AS ENUM ('CAFE', 'ALMOCO', 'JANTAR');

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "menuId" INTEGER NOT NULL,
    "type" "MealTypes" NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("menuId","type")
);

-- CreateTable
CREATE TABLE "MealItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "menuId" INTEGER NOT NULL,
    "mealType" "MealTypes" NOT NULL,

    CONSTRAINT "MealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Menu_date_key" ON "Menu"("date");

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealItem" ADD CONSTRAINT "MealItem_menuId_mealType_fkey" FOREIGN KEY ("menuId", "mealType") REFERENCES "Meal"("menuId", "type") ON DELETE RESTRICT ON UPDATE CASCADE;
