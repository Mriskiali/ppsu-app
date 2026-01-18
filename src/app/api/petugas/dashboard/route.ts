// src/app/api/petugas/dashboard/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        // --- 1. Dapatkan Sesi Pengguna ---
        const session = await getAuthSession();
        if (!session || !session.id) {
            return new NextResponse('Tidak diizinkan (Unauthorized)', { status: 401 });
        }

        const userId = session.id;

        // --- 2. Ambil Data User & Laporannya Secara Bersamaan ---
        const [user, reports] = await Promise.all([
            // Ambil data user yang sedang login
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    petugasId: true,
                    nama: true,
                    noTelp: true,
                    aktif: true,
                    role: true,
                },
            }),

            // Ambil SEMUA laporan yang dibuat oleh user ini
            prisma.laporan.findMany({
                where: {
                    pelaporUserId: userId,
                },
                orderBy: {
                    createdAt: 'desc', // Urutkan dari terbaru
                },
            }),
        ]);

        // --- 3. Cek jika User tidak ditemukan ---
        if (!user) {
            return new NextResponse('User tidak ditemukan', { status: 404 });
        }

        // --- 4. Kirim kedua data dalam satu respons ---
        return NextResponse.json({ user, reports });

    } catch (error: any) {
        console.error('[PETUGAS_DASHBOARD_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}