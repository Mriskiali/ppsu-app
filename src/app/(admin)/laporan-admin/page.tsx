// src/app/(admin)/laporan-admin/page.tsx
"use client";

// 1. Import 'useEffect' untuk mengambil data
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";

// 2. Import Tipe data asli dari Prisma
import type { Laporan, User, ReviewStatus, Bidang } from "@/generated/prisma";

// 3. Import semua komponen UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/emptyState";

// (Semua fungsi helper Anda seperti fmtDate, atStartOfDay, dll, tetap sama)
type RangeOpt = "SEMUA" | "HARI_INI" | "7_HARI" | "30_HARI" | "CUSTOM";
type SortKey = "tanggal" | "bidang" | "status" | "id";
type SortDir = "asc" | "desc";
const STATUS_ORDER: Record<ReviewStatus, number> = {
  PENDING: 0,
  DITERIMA: 1,
  DITOLAK: 2,
};
const tz = "Asia/Jakarta";
function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: tz,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
function atStartOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function isWithin(d: Date, start?: Date, end?: Date) {
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}
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
// --- Akhir fungsi helper ---

// Tipe data baru yang lebih kaya (Laporan + data Pelapor)
type LaporanWithPelapor = Laporan & {
  pelaporUser: {
    id: string;
    nama: string;
    petugasId: string;
  } | null;
};

export default function AdminLaporan() {
  // Ganti 'LAPORAN' dengan array kosong
  const [reports, setReports] = useState<LaporanWithPelapor[]>([]);

  // Tambahkan state loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk filter
  const [bidang, setBidang] = useState<"ALL" | Bidang>("ALL");
  const [status, setStatus] = useState<"ALL" | ReviewStatus>("ALL");
  const [q, setQ] = useState("");
  const [range, setRange] = useState<RangeOpt>("SEMUA");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("tanggal");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Fungsi untuk mengambil data dari API
  const fetchLaporan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/getalllaporan");
      if (!response.ok) {
        throw new Error("Gagal mengambil data laporan");
      }
      const data = await response.json();
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetchLaporan() saat halaman dimuat
  useEffect(() => {
    fetchLaporan();
  }, []); // Array dependensi kosong berarti ini hanya jalan sekali

  // useMemo untuk { startBound, endBound }
  const { startBound, endBound } = useMemo(() => {
    const now = new Date();
    const today0 = atStartOfDay(now);
    if (range === "HARI_INI") {
      const start = today0;
      const end = new Date(today0);
      end.setDate(end.getDate() + 1);
      end.setMilliseconds(-1);
      return { startBound: start, endBound: end };
    }
    if (range === "7_HARI") {
      const start = new Date(today0);
      start.setDate(start.getDate() - 6);
      const end = new Date(today0);
      end.setDate(end.getDate() + 1);
      end.setMilliseconds(-1);
      return { startBound: start, endBound: end };
    }
    if (range === "30_HARI") {
      const start = new Date(today0);
      start.setDate(start.getDate() - 29);
      const end = new Date(today0);
      end.setDate(end.getDate() + 1);
      end.setMilliseconds(-1);
      return { startBound: start, endBound: end };
    }
    if (range === "CUSTOM" && startDate) {
      const start = atStartOfDay(new Date(startDate));
      const end = endDate ? atStartOfDay(new Date(endDate)) : undefined;
      if (end) {
        end.setDate(end.getDate() + 1);
        end.setMilliseconds(-1);
      }
      return { startBound: start, endBound: end };
    }
    return { startBound: undefined, endBound: undefined };
  }, [range, startDate, endDate]);

  // useMemo untuk 'data' (filter & sort)
  const data = useMemo(() => {
    const base = reports
      .filter((l) => (bidang === "ALL" ? true : l.bidang === bidang))
      .filter((l) => (status === "ALL" ? true : l.statusReview === status))
      .filter((l) => {
        if (!q) return true;
        const s = q.toLowerCase();
        return (
          l.judul.toLowerCase().includes(s) ||
          l.deskripsi.toLowerCase().includes(s) ||
          l.id.toLowerCase().includes(s)
        );
      })
      .filter((l) => {
        if (!startBound && !endBound) return true;
        const d = new Date(l.createdAt);
        return isWithin(d, startBound, endBound);
      });

    const sorted = [...base].sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortKey) {
        case "tanggal":
          av = +new Date(a.createdAt);
          bv = +new Date(b.createdAt);
          break;
        case "bidang":
          av = a.bidang;
          bv = b.bidang;
          break;
        case "status":
          av = STATUS_ORDER[a.statusReview];
          bv = STATUS_ORDER[b.statusReview];
          break;
        case "id":
          av = a.id;
          bv = b.id;
          break;
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

    return sorted;
  }, [reports, bidang, status, q, startBound, endBound, sortKey, sortDir]);

  const statusBadgeVariant = (s: ReviewStatus) =>
    s === "PENDING"
      ? "secondary"
      : s === "DITERIMA"
        ? "default"
        : "destructive";

  // State untuk dialog
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi 'doApprove'
  const doApprove = async () => {
    if (!approveId) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/laporan/${approveId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DITERIMA',
          reviewNote: note,
        }),
      });
      if (!response.ok) {
        throw new Error('Gagal menyetujui laporan');
      }
      setApproveId(null);
      setNote("");
      await fetchLaporan(); // Muat ulang data
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi 'doReject'
  const doReject = async () => {
    if (!rejectId) return;
    if (!note.trim()) {
      alert("Catatan penolakan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/laporan/${rejectId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DITOLAK',
          reviewNote: note,
        }),
      });
      if (!response.ok) {
        throw new Error('Gagal menolak laporan');
      }
      setRejectId(null);
      setNote("");
      await fetchLaporan(); // Muat ulang data
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Loading dan Error
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p>Mengambil data laporan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error: {error}</p>
        <Button onClick={fetchLaporan} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  // JSX return
  return (
    <div className="grid gap-6">
      {/* Filter Card */}
      <Card>
        <CardHeader>
          <CardTitle>Review Laporan</CardTitle>
          <CardDescription>
            Filter, urutkan, dan verifikasi laporan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-6">
          <Select value={bidang} onValueChange={(v) => setBidang(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Bidang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Bidang</SelectItem>
              <SelectItem value="KERUSAKAN">KERUSAKAN</SelectItem>
              <SelectItem value="KEBERSIHAN">KEBERSIHAN</SelectItem>
              <SelectItem value="LAINNYA">LAINNYA</SelectItem>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="DITERIMA">DITERIMA</SelectItem>
              <SelectItem value="DITOLAK">DITOLAK</SelectItem>
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={(v) => setRange(v as RangeOpt)}>
            <SelectTrigger>
              <SelectValue placeholder="Rentang waktu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SEMUA">Semua</SelectItem>
              <SelectItem value="HARI_INI">Hari ini</SelectItem>
              {/* --- INI ADALAH PERBAIKANNYA --- */}
              <SelectItem value="7_HARI">7 hari</SelectItem>
              {/* --- -------------------- --- */}
              <SelectItem value="30_HARI">30 hari</SelectItem>
              <SelectItem value="CUSTOM">Custom…</SelectItem>
            </SelectContent>
          </Select>

          {range === "CUSTOM" ? (
            <>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </>
          ) : (
            <>
              <div className="hidden md:block" />
              <div className="hidden md:block" />
            </>
          )}

          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul/deskripsi/ID…"
            className="md:col-span-3"
          />

          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tanggal">Tanggal</SelectItem>
                <SelectItem value="bidang">Bidang</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="id">ID</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortDir}
              onValueChange={(v) => setSortDir(v as SortDir)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Arah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Terbaru → Terlama</SelectItem>
                <SelectItem value="asc">Terlama → Terbaru</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-1 flex items-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setBidang("ALL");
                setStatus("ALL");
                setRange("SEMUA");
                setStartDate("");
                setEndDate("");
                setQ("");
                setSortKey("tanggal");
                setSortDir("desc");
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Data Card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Daftar Laporan</CardTitle>
          <div className="text-sm text-muted-foreground">
            {data.length} hasil
          </div>
        </CardHeader>
        <CardContent className="w-full overflow-x-auto">
          {data.length === 0 ? (
            <EmptyState
              title="Tidak ada laporan"
              description="Ubah filter, rentang tanggal, atau kata kunci."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Tanggal</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Bidang</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pelapor</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="min-w-[260px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((l) => {
                  const pelapor = l.pelaporUser
                    ? l.pelaporUser.nama
                    : `(ID: ${l.pelaporUserId.substring(0, 5)}...)`;
                  const href = mapsHref(l.location);
                  return (
                    <TableRow key={l.id}>
                      <TableCell>{fmtDate(l.createdAt as any)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {l.id.split("-")[0]}...
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate">
                        {l.judul}
                      </TableCell>
                      <TableCell>{l.bidang}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(l.statusReview)}>
                          {l.statusReview}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        {pelapor}
                      </TableCell>
                      <TableCell>
                        {l.location ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-2 hover:underline"
                          >
                            Peta
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <Link href={`/laporan-admin/${l.id}`}>
                          <Button variant="outline" className="rounded-xl">
                            Detail
                          </Button>
                        </Link>

                        {/* Dialog Approve */}
                        <Dialog
                          open={approveId === l.id}
                          onOpenChange={(v) => !v && setApproveId(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              className="rounded-xl"
                              disabled={l.statusReview !== 'PENDING' || isSubmitting}
                              onClick={() => {
                                setApproveId(l.id);
                                setNote(l.reviewNote || "");
                              }}
                            >
                              Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Setujui Laporan</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2">
                              <div className="text-sm text-muted-foreground">
                                {l.judul}
                              </div>
                              <Textarea
                                placeholder="Catatan (opsional)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                disabled={isSubmitting}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={doApprove}
                                className="rounded-xl"
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Dialog Tolak */}
                        <Dialog
                          open={rejectId === l.id}
                          onOpenChange={(v) => !v && setRejectId(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              className="rounded-xl"
                              disabled={l.statusReview !== 'PENDING' || isSubmitting}
                              onClick={() => {
                                setRejectId(l.id);
                                setNote(l.reviewNote || "");
                              }}
                            >
                              Tolak
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Tolak Laporan</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-2">
                              <div className="text-sm text-muted-foreground">
                                {l.judul}
                              </div>
                              <Textarea
                                placeholder="Alasan penolakan (wajib)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                disabled={isSubmitting}
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={doReject}
                                className="rounded-xl"
                                disabled={isSubmitting || !note.trim()}
                              >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}