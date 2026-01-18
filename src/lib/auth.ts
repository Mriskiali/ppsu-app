// src/lib/auth.ts

import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { UserRole } from '@/generated/prisma';

interface JwtPayload {
  userId: string;
  role: UserRole;
  petugasId: string;
  iat: number;
  exp: number;
}
export interface AuthSession {
  id: string;
  role: UserRole;
  petugasId: string;
}

export async function getAuthSession(): Promise<AuthSession | null> {

  // 1. Dapatkan cookie store (DENGAN 'AWAIT')
  const cookieStore = await cookies();

  // 2. Dapatkan cookie 'token' kita
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null; // Tidak ada token, pengguna tidak login
  }

  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET tidak diatur di .env');
    return null;
  }

  try {
    // 5. Verifikasi token
    const payload = verify(token, process.env.JWT_SECRET) as JwtPayload;

    // 6. Kembalikan data pengguna
    return {
      id: payload.userId,
      role: payload.role,
      petugasId: payload.petugasId,
    };

  } catch (error: any) {
    // Token tidak valid (kadaluarsa, dll)
    console.warn('[AUTH_VERIFY_ERROR]', error.message);
    return null; // Token tidak valid
  }
}