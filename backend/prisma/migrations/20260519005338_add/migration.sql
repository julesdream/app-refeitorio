-- CreateEnum
CREATE TYPE "UserRoles" AS ENUM ('SERVIDOR', 'ALUNO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRoles" NOT NULL DEFAULT 'ALUNO';
