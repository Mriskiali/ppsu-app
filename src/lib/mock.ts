// src/lib/mock.ts
import type { User, Laporan } from "./types";

const HASHED_PASSWORD_DUMMY =
  "$2b$10$K.9.ga/M5G.LbeX.S4.N.uJq.3u6v1Y8m.1.d4.s.X.Y.a8.Z.a";

export const USERS: User[] = [
  {
    id: "admin-01",
    role: "ADMIN",
    petugasId: "ADMIN-SUDIN",
    nama: "Admin Kelurahan",
    noTelp: "021-123456",
    aktif: true,
    passwordHash: HASHED_PASSWORD_DUMMY,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "p1",
    role: "PETUGAS",
    petugasId: "JKT-PP01",
    nama: "Andi Saputra",
    noTelp: "0812xxxx",
    aktif: true,
    passwordHash: HASHED_PASSWORD_DUMMY,
    createdAt: "2025-01-02T00:00:00.000Z",
    updatedAt: "2025-01-02T00:00:00.000Z",
  },
  {
    id: "p2",
    role: "PETUGAS",
    petugasId: "JKT-PP02",
    nama: "Siti Rahma",
    noTelp: "0813xxxx",
    aktif: true,
    passwordHash: HASHED_PASSWORD_DUMMY,
    createdAt: "2025-01-03T00:00:00.000Z",
    updatedAt: "2025-01-03T00:00:00.000Z",
  },
  {
    id: "p3",
    role: "PETUGAS",
    petugasId: "JKT-PP03",
    nama: "Budi Santoso",
    noTelp: null,
    aktif: false,
    passwordHash: HASHED_PASSWORD_DUMMY,
    createdAt: "2025-01-04T00:00:00.000Z",
    updatedAt: "2025-01-04T00:00:00.000Z",
  },
];

export const LAPORAN: Laporan[] = [
  {
    id: "l1",
    pelaporUserId: "p2",
    judul: "Pembersihan Tumpukan Sampah Taman RW 05",
    deskripsi: "Telah membersihkan tumpukan sampah liar di sudut taman RW 05.",
    bidang: "KEBERSIHAN",
    statusReview: "PENDING",
    location: "geo:-6.197,106.840", // contoh format geo:
    fotoSesudah: [
      "https://picsum.photos/seed/l1-a/800/600",
      "https://picsum.photos/seed/l1-b/800/600",
    ],
    performedAt: "2025-11-03T08:15:00.000Z",
    performedOn: "2025-11-03",
    reviewedAt: null,
    reviewNote: null,
    createdAt: "2025-11-03T08:20:00.000Z",
    updatedAt: "2025-11-03T08:20:00.000Z",
  },
  {
    id: "l2",
    pelaporUserId: "p1",
    judul: "Perbaikan Tutup Got Jl. Melati 3",
    deskripsi:
      "Tutup got yang patah di Jl. Melati 3 sudah diganti dengan yang baru.",
    bidang: "KERUSAKAN",
    statusReview: "DITERIMA",
    location: "https://maps.app.goo.gl/abcdEFGhijk", // contoh link Maps
    fotoSesudah: ["https://picsum.photos/seed/l2-a/800/600"],
    performedAt: "2025-11-02T14:30:00.000Z",
    performedOn: "2025-11-02",
    reviewedAt: "2025-11-02T16:00:00.000Z",
    reviewNote: "Pekerjaan baik dan cepat. Sudah diverifikasi.",
    createdAt: "2025-11-02T15:00:00.000Z",
    updatedAt: "2025-11-02T16:00:00.000Z",
  },
  {
    id: "l3",
    pelaporUserId: "p2",
    judul: "Pembersihan Ranting Pohon Tumbang",
    deskripsi: "Membersihkan sisa ranting pohon tumbang di Posyandu.",
    bidang: "LAINNYA",
    statusReview: "DITOLAK",
    location: "Posyandu Mawar, RT 02/RW 05, Kelurahan Contoh",
    fotoSesudah: ["https://picsum.photos/seed/l3-a/800/600"],
    performedAt: "2025-11-02T10:00:00.000Z",
    performedOn: "2025-11-02",
    reviewedAt: "2025-11-02T10:30:00.000Z",
    reviewNote:
      "Laporan duplikat. Sudah dikerjakan oleh tim lain (Laporan #l2b).",
    createdAt: "2025-11-02T10:05:00.000Z",
    updatedAt: "2025-11-02T10:30:00.000Z",
  },
];
