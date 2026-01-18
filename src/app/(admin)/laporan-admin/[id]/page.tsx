// src/app/(admin)/laporan-admin/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Laporan, User, ReviewStatus, Bidang } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, MapPin, User as UserIcon, Calendar, Info } from "lucide-react";

// Tipe data yang kita harapkan dari API (Laporan + Pelapor)
type LaporanWithPelapor = Laporan & {
    pelaporUser: {
        id: string;
        nama: string;
        petugasId: string;
    } | null;
};

// Helper untuk Badge Status
const statusBadgeVariant = (s: ReviewStatus) =>
    s === "PENDING" ? "secondary" : s === "DITERIMA" ? "default" : "destructive";

// Helper untuk Format Tanggal (Sama seperti di halaman riwayat)
function fmtDate(iso?: string | null) {
    if (!iso) return "-";
    try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat("id-ID", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Asia/Jakarta",
        }).format(d);
    } catch {
        return "-";
    }
}

// Helper untuk Link Peta
const isMapsUrl = (s: string) =>
    /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.[a-z.]+\/maps)/i.test(
        s
    );
const mapsHref = (location?: string | null) =>
    !location
        ? undefined
        : isMapsUrl(location)
            ? location
            : location.startsWith("geo:")
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    location.replace(/^geo:/i, "")
                )}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    location
                )}`;

export default function LaporanDetailPage() {
    const params = useParams(); // Hook untuk mengambil [id] dari URL
    const { id: laporanId } = params;

    const [laporan, setLaporan] = useState<LaporanWithPelapor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!laporanId) return;

        const fetchLaporanDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/laporan/${laporanId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Gagal mengambil data");
                }
                const data = await response.json();
                setLaporan(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLaporanDetail();
    }, [laporanId]);

    // Handler Loading dan Error
    if (isLoading) {
        return <div className="p-6 text-center">Memuat data laporan...</div>;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-6 text-center text-red-600">
                <p>Error: {error}</p>
                <Link href="/laporan-admin">
                    <Button variant="outline" className="mt-4 rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar
                    </Button>
                </Link>
            </div>
        );
    }

    if (!laporan) {
        return <div className="p-6 text-center">Laporan tidak ditemukan.</div>;
    }

    // Tampilan Sukses (JSX Utama)
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            {/* Tombol Kembali */}
            <div className="mb-4">
                <Link href="/laporan-admin">
                    <Button variant="outline" className="rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar Laporan
                    </Button>
                </Link>
            </div>

            {/* Konten Utama */}
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                {/* Header (Judul dan Status) */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                            {laporan.bidang}
                        </span>
                        <Badge
                            variant={statusBadgeVariant(laporan.statusReview)}
                            className="text-sm"
                        >
                            {laporan.statusReview}
                        </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">{laporan.judul}</h1>
                </div>

                {/* Galeri Foto */}
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-3">Foto Laporan</h2>
                    {laporan.fotoSesudah && laporan.fotoSesudah.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {laporan.fotoSesudah.map((fotoUrl, index) => (
                                <a
                                    key={index}
                                    href={fotoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block aspect-square rounded-lg overflow-hidden border bg-muted"
                                >
                                    <img
                                        src={fotoUrl}
                                        alt={`Foto laporan ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Tidak ada foto.</p>
                    )}
                </div>

                {/* Detail Info */}
                <div className="p-6 border-t space-y-4">
                    {/* Deskripsi */}
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Deskripsi</h2>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {laporan.deskripsi || "-"}
                        </p>
                    </div>

                    {/* Catatan Review (Jika ada) */}
                    {laporan.reviewNote && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-2" />
                                Catatan Review
                            </h2>
                            <p className="text-muted-foreground italic whitespace-pre-wrap">
                                "{laporan.reviewNote}"
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {/* Perbaikan TS: 'as any' */}
                                Direview pada: {fmtDate(laporan.reviewedAt as any)}
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <UserIcon className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <span className="text-sm font-medium">Pelapor</span>
                                <p className="text-muted-foreground">
                                    {laporan.pelaporUser?.nama || "N/A"} (
                                    {laporan.pelaporUser?.petugasId || "N/A"})
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <span className="text-sm font-medium">Waktu Pelaksanaan</span>
                                <p className="text-muted-foreground">
                                    {/* Perbaikan TS: 'as any' */}
                                    {fmtDate(laporan.performedAt as any)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <span className="text-sm font-medium">Lokasi</span>
                                {laporan.location ? (
                                    <a
                                        href={mapsHref(laporan.location) || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Buka Peta
                                    </a>
                                ) : (
                                    <p className="text-muted-foreground">-</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                            <div>
                                <span className="text-sm font-medium">Dibuat Pada</span>
                                <p className="text-muted-foreground">
                                    {/* Perbaikan TS: 'as any' */}
                                    {fmtDate(laporan.createdAt as any)}
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}