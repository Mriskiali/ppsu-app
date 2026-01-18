// src/lib/types.ts
export type UserRole = "ADMIN" | "PETUGAS";
export type ReviewStatus = "PENDING" | "DITERIMA" | "DITOLAK";
export type Bidang = "KERUSAKAN" | "KEBERSIHAN" | "LAINNYA";

export type User = {
  id: string;
  role: UserRole;
  petugasId: string;
  nama: string;
  noTelp?: string | null;
  aktif: boolean;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type Laporan = {
  id: string;
  pelaporUserId: string;
  judul: string;
  deskripsi: string;
  bidang: Bidang;
  statusReview: ReviewStatus;
  location: string; // sesuai schema terbaru
  fotoSesudah: string[];
  performedAt?: string | null;
  performedOn?: string | null; // "YYYY-MM-DD"
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
};
