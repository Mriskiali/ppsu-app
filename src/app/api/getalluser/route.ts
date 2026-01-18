// src/app/api/getalluser/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { UserRole as PrismaRole } from '@/generated/prisma';

export async function GET(req: Request) {
    try {
        // --- 1. Cek Autentikasi ---
        const session = await getAuthSession();
        if (session?.role !== 'ADMIN') {
            return new NextResponse('Tidak diizinkan (Forbidden)', { status: 403 });
        }

        // --- 2. Ambil Filter (jika ada) ---
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        const whereClause: any = {};
        if (role && (role === 'ADMIN' || role === 'PETUGAS')) {
            whereClause.role = role as PrismaRole;
        }

        // --- 3. Ambil Data dari Database ---
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                role: true,
                petugasId: true,
                nama: true,
                noTelp: true,
                aktif: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // --- 5. Kirim Respons ---
        return NextResponse.json(users);

    } catch (error: any) {
        console.error('[GET_ALL_USERS_ERROR]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}