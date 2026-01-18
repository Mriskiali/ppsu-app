// src/app/api/profil/password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function PATCH(req: Request) {
    try {
        // 1. Dapatkan sesi user
        const session = await getAuthSession();
        if (!session?.id) {
            return new NextResponse('Tidak diizinkan', { status: 401 });
        }

        // 2. Ambil data dari body
        const body = await req.json();
        const { curPwd, newPwd } = body;

        if (!curPwd || !newPwd || newPwd.length < 6) {
            return new NextResponse('Password tidak valid', { status: 400 });
        }

        // 3. Ambil data user LENGKAP (termasuk passwordHash)
        const user = await prisma.user.findUnique({
            where: { id: session.id },
        });

        if (!user) {
            return new NextResponse('User tidak ditemukan', { status: 404 });
        }

        // 4. Verifikasi password lama
        const isPasswordValid = await bcrypt.compare(curPwd, user.passwordHash);
        if (!isPasswordValid) {
            return new NextResponse('Password saat ini salah', { status: 400 });
        }

        // 5. Hash password baru
        const newPasswordHash = await bcrypt.hash(newPwd, 12);

        // 6. Update password di database
        await prisma.user.update({
            where: { id: session.id },
            data: {
                passwordHash: newPasswordHash,
            },
        });

        return NextResponse.json({ message: 'Password berhasil diperbarui' });

    } catch (error: any) {
        console.error('[PROFIL_PASSWORD_PATCH]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}