// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(req: Request) {
    // Buat cookie yang "kadaluarsa" (maxAge: -1)
    const cookie = serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: -1, // Perintahkan browser untuk menghapusnya
    });

    const response = NextResponse.json({
        message: 'Logout berhasil',
    });

    // Set cookie yang sudah kadaluarsa itu
    response.headers.set('Set-Cookie', cookie);
    return response;
}