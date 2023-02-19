-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "league_name" VARCHAR(255) NOT NULL,
    "league_owner" TEXT NOT NULL,
    "league_type" VARCHAR(255) NOT NULL DEFAULT 'Re-Draft',
    "league_size" INTEGER NOT NULL,
    "draft_type" VARCHAR(255) NOT NULL DEFAULT 'Snake',

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLeagues" (
    "username" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,

    CONSTRAINT "UserLeagues_pkey" PRIMARY KEY ("username","leagueId")
);

-- CreateTable
CREATE TABLE "Team" (
    "userId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "team_name" VARCHAR(50) NOT NULL,
    "starters" JSONB[],
    "bench" JSONB[],
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "qbs" INTEGER NOT NULL DEFAULT 0,
    "rbs" INTEGER NOT NULL DEFAULT 0,
    "wrs" INTEGER NOT NULL DEFAULT 0,
    "tes" INTEGER NOT NULL DEFAULT 0,
    "team" INTEGER NOT NULL DEFAULT 0,
    "maxQB" INTEGER NOT NULL DEFAULT 2,
    "maxRB" INTEGER NOT NULL DEFAULT 2,
    "maxWR" INTEGER NOT NULL DEFAULT 4,
    "maxTE" INTEGER NOT NULL DEFAULT 2,
    "maxTeam" INTEGER NOT NULL DEFAULT 8,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("userId","leagueId")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "token" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_league_owner_fkey" FOREIGN KEY ("league_owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeagues" ADD CONSTRAINT "UserLeagues_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeagues" ADD CONSTRAINT "UserLeagues_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
