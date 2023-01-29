-- DropForeignKey
ALTER TABLE "UserLeagues" DROP CONSTRAINT "UserLeagues_username_fkey";

-- AddForeignKey
ALTER TABLE "UserLeagues" ADD CONSTRAINT "UserLeagues_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
