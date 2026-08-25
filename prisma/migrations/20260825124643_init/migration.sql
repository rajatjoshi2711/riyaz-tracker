-- CreateEnum
CREATE TYPE "RiyazType" AS ENUM ('AALAP', 'JOD', 'TAAL_VISTAR', 'SONGS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Raag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Raag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiyazSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raagId" TEXT NOT NULL,
    "practiceDate" DATE NOT NULL,
    "durationMinutes" INTEGER,
    "types" "RiyazType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiyazSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Raag_normalizedName_key" ON "Raag"("normalizedName");

-- CreateIndex
CREATE INDEX "RiyazSession_userId_practiceDate_idx" ON "RiyazSession"("userId", "practiceDate");

-- AddForeignKey
ALTER TABLE "Raag" ADD CONSTRAINT "Raag_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiyazSession" ADD CONSTRAINT "RiyazSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiyazSession" ADD CONSTRAINT "RiyazSession_raagId_fkey" FOREIGN KEY ("raagId") REFERENCES "Raag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
