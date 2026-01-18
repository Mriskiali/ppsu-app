// src/app/api/getalllaporan/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { Bidang, ReviewStatus } from '@/generated/prisma';

export async function GET(req: Request) {
    try {
        // --- 1. Cek Autentikasi ---
        const session = await getAuthSession();
        if (!session) {
            // Walaupun ini ADMIN, kita cek saja
            return new NextResponse('Tidak diizinkan (Forbidden)', { status: 403 });
        }

        // --- 2. Ambil Filter  ---
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const bidang = searchParams.get('bidang');

        const whereClause: any = {};
        if (status && ['PENDING', 'DITERIMA', 'DITOLAK'].includes(status)) {
            whereClause.statusReview = status as ReviewStatus;
        }
        if (bidang && ['KERUSAKAN', 'KEBERSIHAN', 'LAINNYA'].includes(bidang)) {
            whereClause.bidang = bidang as Bidang;
        }

        // --- 3. Ambil Data dari Database ---
        const laporan = await prisma.laporan.findMany({
            where: whereClause,
            include: {
                pelaporUser: {
                    select: {
                        id: true,
                        nama: true,
                        petugasId: true,
                    },
                },
            },

            orderBy: {
                createdAt: 'desc', // Tampilkan yang terbaru dulu
            },
        });

        // --- 5. Kirim Respons ---
        return NextResponse.json(laporan);

    } catch (error: any) {
        console.error('[GET_ALL_LAPORAN_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}