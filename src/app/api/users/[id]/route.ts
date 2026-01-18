// src/app/api/users/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { UserRole as PrismaRole } from '@/generated/prisma';

async function checkAdminAuth() {
    const session = await getAuthSession();
    if (session?.role !== 'ADMIN') {
        throw new Error('Tidak diizinkan');
    }
    return session;
}

// --- GET (Membaca 1 Petugas) ---
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await checkAdminAuth();

        const user = await prisma.user.findUnique({
            where: { id: params.id },
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
        });

        if (!user) {
            return new NextResponse('User tidak ditemukan', { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error: any) {
        if (error.message === 'Tidak diizinkan') {
            return new NextResponse(error.message, { status: 403 });
        }
        console.error('[USERS_GET_BY_ID]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await checkAdminAuth();

        const body = await req.json();
        const { nama, role, noTelp, aktif } = body;

        if (role && role !== 'ADMIN' && role !== 'PETUGAS') {
            return new NextResponse('Role tidak valid', { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: {
                nama,
                role: role as PrismaRole,
                noTelp,
                aktif,
            },
        });

        const { passwordHash: _, ...updatedUser } = user;
        return NextResponse.json(updatedUser);
    } catch (error: any) {
        if (error.message === 'Tidak diizinkan') {
            return new NextResponse(error.message, { status: 403 });
        }
        console.error('[USERS_PATCH]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await checkAdminAuth();

        const user = await prisma.user.delete({
            where: { id: params.id },
        });

        const { passwordHash: _, ...deletedUser } = user;
        return NextResponse.json(deletedUser);
    } catch (error: any) {
        if (error.message === 'Tidak diizinkan') {
            return new NextResponse(error.message, { status: 403 });
        }
        console.error('[USERS_DELETE]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}