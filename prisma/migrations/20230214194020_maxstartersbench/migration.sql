-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "benchMax" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "startersMax" INTEGER NOT NULL DEFAULT 5;