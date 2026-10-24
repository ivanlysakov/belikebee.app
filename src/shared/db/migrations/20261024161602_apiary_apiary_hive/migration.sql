-- CreateTable
CREATE TABLE "Apiary" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hive" (
    "id" TEXT NOT NULL,
    "apiaryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Apiary_ownerId_idx" ON "Apiary"("ownerId");

-- CreateIndex
CREATE INDEX "Hive_apiaryId_idx" ON "Hive"("apiaryId");

-- AddForeignKey
ALTER TABLE "Hive" ADD CONSTRAINT "Hive_apiaryId_fkey" FOREIGN KEY ("apiaryId") REFERENCES "Apiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

