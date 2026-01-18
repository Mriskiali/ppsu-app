// src/app/api/profil/data/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(req: Request) {
    try {
        // 1. Dapatkan sesi user
        const session = await getAuthSession();
        if (!session?.id) {
            return new NextResponse('Tidak diizinkan', { status: 401 });
        }

        // 2. Ambil data dari body
        const body = await req.json();
        const { nama, noTelp } = body;

        // Validasi sederhana
        if (!nama || nama.trim().length === 0) {
            return new NextResponse('Nama tidak boleh kosong', { status: 400 });
        }

        // 3. Update user di database
        const updatedUser = await prisma.user.update({
            where: { id: session.id },
            data: {
                nama: nama.trim(),
                noTelp: noTelp ? noTelp.trim() : null,
            },
        });

        // 4. Kirim kembali data user yang sudah di-update
        // (PENTING: Hapus passwordHash sebelum mengirim)
        const { passwordHash, ...safeUserData } = updatedUser;
        return NextResponse.json(safeUserData);

    } catch (error: any) {
        console.error('[PROFIL_DATA_PATCH]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}