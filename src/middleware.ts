// src/middleware.ts

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthSession } from './lib/auth';

// 1. halaman publik (yang Boleh diakses tanpa login)
const publicPages = ['/login'];
// API publik
const publicApi = ['/api/auth/login'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 2. Cek apakah ini API publik atau halaman publik
    const isPublicPage = publicPages.includes(pathname);
    const isPublicApi = publicApi.some(apiPath => pathname.startsWith(apiPath));

    // Jika ini rute publik, biarkan saja (langsung lolos)
    if (isPublicPage || isPublicApi) {
        return NextResponse.next();
    }

    // 3. Dapatkan sesi (hanya untuk rute yang dilindungi)
    const session = await getAuthSession();

    // 4. LOGIKA PENGGUNA YANG BELUM LOGIN
    if (!session) {
        // Jika dia mencoba mengakses API yang dilindungi
        if (pathname.startsWith('/api/')) {
            return new NextResponse(JSON.stringify({ message: 'Otentikasi diperlukan.' }), { status: 401 });
        }

        // Jika dia mencoba mengakses Halaman yang dilindungi
        // Arahkan dia ke halaman login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 5. LOGIKA PENGGUNA SUDAH LOGIN
    const { role } = session;

    // Halaman Admin adalah: /admin, /laporan-admin, /petugas
    const isAdminRoute =
        pathname === '/admin' ||
        pathname.startsWith('/laporan-admin') ||
        pathname.startsWith('/petugas');

    // Halaman Petugas adalah: / (dashboard), /riwayat, /profil, /buat-laporan
    const isPetugasRoute =
        pathname === '/' || // <-- Dashboard Petugas ada di root
        pathname.startsWith('/riwayat') ||
        pathname.startsWith('/profil') ||
        pathname.startsWith('/buat-laporan');

    // Jika Petugas (role PETUGAS) mencoba akses halaman Admin
    if (role === 'PETUGAS' && isAdminRoute) {
        return NextResponse.redirect(new URL('/', request.url)); // Lempar ke beranda petugas (/)
    }

    // Jika Admin (role ADMIN) mencoba akses halaman Petugas
    if (role === 'ADMIN' && isPetugasRoute) {
        // Arahkan Admin ke dashboard-nya, yaitu /admin
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // 6. Jika semua lolos, izinkan request
    return NextResponse.next();
}

// 7. Konfigurasi Matcher (jalankan di SEMUA rute, kecuali file statis)
export const config = {
    matcher: [
        /*
         * Kecualikan file-file aset dan _next
         * agar middleware tidak bekerja terlalu keras.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ],
};