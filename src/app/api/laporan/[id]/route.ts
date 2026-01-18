// src/app/api/laporan/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

// Endpoint ini untuk mengambil SATU laporan detail
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Cek Autentikasi (Bisa Admin atau Petugas)
        const session = await getAuthSession();
        if (!session?.id) {
            return new NextResponse('Tidak diizinkan', { status: 401 });
        }

        // 2. Ambil ID Laporan dari URL
        const { id: laporanId } = params;
        if (!laporanId) {
            return new NextResponse('ID Laporan tidak ditemukan', { status: 400 });
        }

        // 3. Cari laporan di database
        const laporan = await prisma.laporan.findUnique({
            where: {
                id: laporanId,
            },
            include: {
                // 4. Sertakan juga data 'pelaporUser'
                pelaporUser: {
                    select: {
                        id: true,
                        nama: true,
                        petugasId: true,
                    },
                },
            },
        });

        if (!laporan) {
            return new NextResponse('Laporan tidak ditemukan', { status: 404 });
        }

        // 5. Cek Izin: Hanya Admin atau Pemilik Laporan
        if (session.role !== 'ADMIN' && laporan.pelaporUserId !== session.id) {
            return new NextResponse('Akses dilarang', { status: 403 });
        }

        // 6. Kirim data laporan
        return NextResponse.json(laporan);

    } catch (error: any) {
        console.error('[LAPORAN_GET_BY_ID]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}