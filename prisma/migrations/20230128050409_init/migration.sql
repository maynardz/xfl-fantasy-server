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

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLeagues" (
    "username" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,

    CONSTRAINT "UserLeagues_pkey" PRIMARY KEY ("username","leagueId")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "pos" VARCHAR(255) NOT NULL,
    "team" VARCHAR(255) NOT NULL,
    "college" VARCHAR(255) NOT NULL,
    "player_image" VARCHAR(255) DEFAULT '',

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL,
    "opponent" VARCHAR(255),
    "completions_attempts" VARCHAR(255),
    "passing_pct" VARCHAR(255),
    "passing_yd" INTEGER,
    "passing_td" INTEGER,
    "int" INTEGER,
    "fuml" INTEGER,
    "car" INTEGER,
    "rushing_yd" INTEGER,
    "rushing_td" INTEGER,
    "rushing_avg" INTEGER,
    "rec" INTEGER,
    "receiving_yd" INTEGER,
    "receiving_td" INTEGER,
    "receiving_avg" INTEGER,
    "targets" INTEGER,
    "misc_td" INTEGER,
    "fpts" INTEGER,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_league_owner_fkey" FOREIGN KEY ("league_owner") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeagues" ADD CONSTRAINT "UserLeagues_username_fkey" FOREIGN KEY ("username") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeagues" ADD CONSTRAINT "UserLeagues_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stats" ADD CONSTRAINT "Stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
