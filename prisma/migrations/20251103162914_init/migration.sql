-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PETUGAS');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'DITERIMA', 'DITOLAK');

-- CreateEnum
CREATE TYPE "Bidang" AS ENUM ('KERUSAKAN', 'KEBERSIHAN', 'LAINNYA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PETUGAS',
    "petugasId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "noTelp" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" TEXT NOT NULL,
    "pelaporUserId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "bidang" "Bidang" NOT NULL,
    "statusReview" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "fotoSesudah" TEXT[],
    "performedAt" TIMESTAMP(3),
    "performedOn" DATE,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_petugasId_key" ON "User"("petugasId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_aktif_idx" ON "User"("aktif");

-- CreateIndex
CREATE INDEX "Laporan_pelaporUserId_createdAt_idx" ON "Laporan"("pelaporUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Laporan_statusReview_createdAt_idx" ON "Laporan"("statusReview", "createdAt");

-- CreateIndex
CREATE INDEX "Laporan_bidang_idx" ON "Laporan"("bidang");

-- CreateIndex
CREATE INDEX "Laporan_performedOn_statusReview_idx" ON "Laporan"("performedOn", "statusReview");

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_pelaporUserId_fkey" FOREIGN KEY ("pelaporUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
