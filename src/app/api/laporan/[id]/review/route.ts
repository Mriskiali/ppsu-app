// src/app/api/laporan/[id]/review/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { ReviewStatus } from '@/generated/prisma';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // --- 1. Cek Autentikasi Admin ---
        const session = await getAuthSession();
        if (session?.role !== 'ADMIN') {
            return new NextResponse('Tidak diizinkan (Forbidden)', { status: 403 });
        }

        // --- 2. Ambil data baru dari body request ---
        const body = await req.json();
        const { status, reviewNote } = body;

        // --- 3. Ambil ID Laporan dari URL ---
        const { id: laporanId } = params;
        if (!laporanId) {
            return new NextResponse('ID Laporan tidak ditemukan', { status: 400 });
        }

        // Validasi status yang masuk
        if (status !== 'DITERIMA' && status !== 'DITOLAK') {
            return new NextResponse('Status tidak valid', { status: 400 });
        }

        // --- 4. Update Laporan di Database ---
        const updatedLaporan = await prisma.laporan.update({
            where: {
                id: laporanId,
            },
            data: {
                statusReview: status as ReviewStatus,
                reviewNote: reviewNote || null,
                reviewedAt: new Date(),
            },
        });

        return NextResponse.json(updatedLaporan);

    } catch (error: any) {
        console.error('[LAPORAN_REVIEW_PATCH]', error);
        if (error.code === 'P2025') {
            return new NextResponse('Laporan tidak ditemukan', { status: 404 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}