// src/app/api/auth/login/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '@/generated/prisma';
import { serialize } from 'cookie';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { petugasId, password } = body;

        if (!petugasId || !password) {
            return new NextResponse('ID Petugas dan password wajib diisi', { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { petugasId: petugasId },
        });

        if (!user) {
            return new NextResponse('ID Petugas atau password salah', { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return new NextResponse('ID Petugas atau password salah', { status: 401 });
        }

        if (!user.aktif) {
            return new NextResponse('Akun ini tidak aktif', { status: 403 });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET tidak diatur di .env');
        }

        const tokenPayload = {
            userId: user.id,
            role: user.role as UserRole,
            petugasId: user.petugasId,
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '1d', // 1 hari
        });

        // 1. Buat Cookie
        const cookie = serialize('token', token, {
            httpOnly: true, // Cookie tidak bisa diakses JS di browser
            secure: process.env.NODE_ENV === 'production', // Hanya HTTPS di production
            path: '/', // Berlaku di semua path
            maxAge: 60 * 60 * 24, // 1 hari (sama dengan token)
        });

        // 2. Hapus passwordHash dari data user
        const { passwordHash, ...userData } = user;

        // 3. Buat respons dan ATUR COOKIE di header
        const response = NextResponse.json({
            user: userData,
            // Kita tidak perlu kirim token di body lagi
        });

        response.headers.set('Set-Cookie', cookie);
        return response;
    } catch (error: any) {
        console.error('[AUTH_LOGIN_POST]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}