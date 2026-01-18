// src/app/api/users/[id]/reset-password/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { UserRole } from '@/generated/prisma';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Cek Autentikasi Admin
        const session = await getAuthSession();
        if (session?.role !== 'ADMIN') {
            return new NextResponse('Tidak diizinkan (Forbidden)', { status: 403 });
        }

        // 2. Ambil data dari body (HARUS PERTAMA)
        const body = await req.json();
        const { newPassword } = body;

        // 3. Ambil ID Petugas dari URL
        const { id: userIdToReset } = params;

        // Validasi
        if (!newPassword || newPassword.length < 6) {
            return new NextResponse('Password baru minimal 6 karakter', { status: 400 });
        }
        if (!userIdToReset) {
            return new NextResponse('ID Petugas tidak ditemukan', { status: 400 });
        }

        // 4. Hash password baru
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // 5. Update password di database
        await prisma.user.update({
            where: {
                id: userIdToReset,
            },
            data: {
                passwordHash: passwordHash,
            },
        });

        return NextResponse.json({ message: 'Password petugas berhasil direset' });

    } catch (error: any) {
        console.error('[RESET_PASSWORD_PATCH]', error);
        if (error.code === 'P2025') {
            return new NextResponse('Petugas tidak ditemukan', { status: 404 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}