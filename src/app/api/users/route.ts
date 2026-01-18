// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getAuthSession } from '@/lib/auth';
import { UserRole as PrismaRole } from '@/generated/prisma';

export async function POST(req: Request) {
    try {
        // --- Cek Autentikasi Admin ---
        const session = await getAuthSession();
        if (session?.role !== 'ADMIN') {
            return new NextResponse('Tidak diizinkan', { status: 403 });
        }
        // --- Selesai Cek Auth ---

        const body = await req.json();
        const { petugasId, nama, password, role, noTelp, aktif } = body;

        if (!petugasId || !nama || !password || !role) {
            return new NextResponse(
                'Data wajib (petugasId, nama, password, role) tidak lengkap',
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { petugasId },
        });

        if (existingUser) {
            return new NextResponse('petugasId sudah digunakan', { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                petugasId,
                nama,
                passwordHash,
                role: role as PrismaRole,
                noTelp,
                aktif: aktif === undefined ? true : Boolean(aktif),
            },
        });

        const { passwordHash: _, ...newUser } = user;
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('[USERS_POST]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        // --- Cek Autentikasi Admin ---
        const session = await getAuthSession();
        if (session?.role !== 'ADMIN') {
            return new NextResponse('Tidak diizinkan', { status: 403 });
        }
        // --- Selesai Cek Auth ---

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let whereClause = {};
        if (role && (role === 'ADMIN' || role === 'PETUGAS')) {
            whereClause = {
                role: role as PrismaRole,
            };
        }

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

        return NextResponse.json(users);
    } catch (error) {
        console.error('[USERS_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}