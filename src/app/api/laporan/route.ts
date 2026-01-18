// src/app/api/laporan/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { cloudinary } from '@/lib/cloudinary';
import { Bidang } from '@/generated/prisma';
import streamifier from 'streamifier';

/**
 * Helper function untuk meng-upload file buffer ke Cloudinary
 * @param fileBuffer - Buffer dari file yang di-upload
 * @param folder - Nama folder di Cloudinary
 * @returns Promise yang resolve dengan hasil upload Cloudinary
 */
const uploadToCloudinary = (
    fileBuffer: Buffer,
    folder: string
): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Buat stream upload ke Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder, // Nama folder kustom di Cloudinary
                resource_type: 'image', // Tentukan tipe resource
            },
            (error, result) => {
                if (error) {
                    reject(error); // Gagal upload
                } else if (result) {
                    resolve(result); // Sukses upload
                } else {
                    reject(new Error('Upload ke Cloudinary gagal tanpa error eksplisit.'));
                }
            }
        );

        // Pipe buffer file ke stream upload Cloudinary
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

// ==========================================================
// === API Endpoint Utama untuk CREATE Laporan ===
// ==========================================================
export async function POST(req: Request) {
    try {
        // --- 1. Cek Autentikasi ---
        const session = await getAuthSession();
        if (!session) {
            return new NextResponse('Tidak diizinkan (Unauthorized)', { status: 401 });
        }
        const pelaporUserId = session.id;

        // --- 2. Parse FormData ---
        const formData = await req.formData();
        const judul = formData.get('judul') as string;
        const deskripsi = formData.get('deskripsi') as string;
        const bidang = formData.get('bidang') as Bidang;
        const location = formData.get('location') as string;
        const performedAt = formData.get('performedAt') as string;
        const files = formData.getAll('fotoSesudah') as File[];

        if (!judul || !deskripsi || !bidang || !location || !performedAt) {
            return new NextResponse('Data wajib tidak lengkap', { status: 400 });
        }
        if (files.length === 0) {
            return new NextResponse('Minimal 1 foto diperlukan', { status: 400 });
        }

        // --- 3. Proses Upload File ke Cloudinary ---
        const fotoUrls: string[] = [];

        // Tentukan nama folder di Cloudinary (contoh: laporan/[user_id])
        const uploadFolder = `laporan/${pelaporUserId}`;

        for (const file of files) {
            // Dapatkan buffer dari file
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            try {
                // Panggil helper upload kita
                const result = await uploadToCloudinary(fileBuffer, uploadFolder);

                // Simpan URL yang aman (HTTPS)
                fotoUrls.push(result.secure_url);
            } catch (uploadError) {
                console.error('Cloudinary Upload Error:', uploadError);
                throw new Error('Gagal mengupload salah satu file ke Cloudinary');
            }
        }

        // --- 4. Simpan Laporan ke Database (Prisma) ---
        const newLaporan = await prisma.laporan.create({
            data: {
                pelaporUserId: pelaporUserId,
                judul,
                deskripsi,
                bidang,
                location,
                performedAt: new Date(performedAt),
                performedOn: new Date(performedAt),
                fotoSesudah: fotoUrls, // <-- Array URL dari Cloudinary
            },
        });

        return NextResponse.json(newLaporan, { status: 201 });

    } catch (error: any) {
        console.error('[LAPORAN_POST]', error);
        if (error.message.includes('Cloudinary')) {
            return new NextResponse(error.message, { status: 500 });
        }
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}