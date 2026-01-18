// src/app/(admin)/dashboard/page.tsx
"use client";

// 1. Import 'useEffect'
import { useMemo, useState, useEffect } from "react";

// 2. HAPUS mock
// import { LAPORAN, USERS } from "@/lib/mock"; 

// 3. Ganti tipe mock dengan tipe Prisma
import type { Laporan, ReviewStatus, User } from "@/generated/prisma";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link2 } from "lucide-react";

const tz = "Asia/Jakarta";

// ... (Semua fungsi helper Anda 'fmtDateTime', 'todayLocalISODate', dll, SAMA PERSIS) ...
function fmtDateTime(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: tz,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
function todayLocalISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
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
// --- Akhir helper ---


// 4. Tipe data baru untuk Laporan + Pelapor (diperlukan API)
type LaporanWithPelapor = Laporan & {
  pelaporUser: {
    id: string;
    nama: string;
    petugasId: string;
  } | null;
};

export default function AdminDashboard() {

  // 5. Ubah state agar dimulai dari array kosong
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<LaporanWithPelapor[]>([]);

  // 6. Tambahkan state loading & error halaman
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // 7. Ambil data dari API saat halaman dimuat
  useEffect(() => {
    const fetchData = async () => {
      setIsPageLoading(true);
      setPageError(null);
      try {
        const [reportsRes, usersRes] = await Promise.all([
          fetch("/api/getalllaporan"), // Panggil API Laporan
          fetch("/api/getalluser?role=PETUGAS"), // Panggil API User
        ]);

        if (!reportsRes.ok || !usersRes.ok) {
          throw new Error("Gagal mengambil data dari server");
        }

        const reportsData: LaporanWithPelapor[] = await reportsRes.json();
        const usersData: User[] = await usersRes.json();

        setReports(reportsData);
        setUsers(usersData);

      } catch (err: any) {
        setPageError(err.message);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchData();
  }, []); // '[]' = Hanya jalan sekali

  // --- Mulai dari sini, semua kalkulasi 'useMemo' Anda SAMA PERSIS ---
  const countsByStatus = useMemo(() => {
    const map: Record<ReviewStatus, number> = {
      PENDING: 0,
      DITERIMA: 0,
      DITOLAK: 0,
    };
    for (const r of reports) map[r.statusReview] += 1;
    return map;
  }, [reports]);

  const totalReports = reports.length || 1; // totalReports.length kini 0 di awal, jadi '|| 1' penting
  const pct = {
    PENDING: Math.round((countsByStatus.PENDING / totalReports) * 100),
    DITERIMA: Math.round((countsByStatus.DITERIMA / totalReports) * 100),
    DITOLAK: Math.round((countsByStatus.DITOLAK / totalReports) * 100),
  };

  const latest = useMemo(
    () =>
      [...reports]
        .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
        .slice(0, 8),
    [reports]
  );

  const today = todayLocalISODate();
  const submittedTodayBy = useMemo(() => {
    const setIds = new Set<string>();
    for (const r of reports) {
      // 8. Perbaikan kecil agar 'performedOn' (Date) bisa dibandingkan dengan 'today' (string)
      const performedOnDate = r.performedOn ? new Date(r.performedOn).toISOString().slice(0, 10) : '';
      const createdAtDate = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '';

      if (performedOnDate === today || createdAtDate === today) {
        setIds.add(r.pelaporUserId);
      }
    }
    return setIds;
  }, [reports, today]);

  const belumLaporHariIni = useMemo(
    () => users.filter((u) => u.aktif && !submittedTodayBy.has(u.id)),
    [users, submittedTodayBy]
  );

  const statusBadgeVariant = (s: ReviewStatus) =>
    s === "PENDING"
      ? "secondary"
      : s === "DITERIMA"
        ? "default"
        : "destructive";
  // --- Akhir 'useMemo' ---


  // --- Fungsi 'savePetugas' Anda SAMA PERSIS seperti di kode awal Anda ---
  const [openDialog, setOpenDialog] = useState(false);
  const [newNama, setNewNama] = useState("");
  const [newPetugasId, setNewPetugasId] = useState("");
  const [newNoTelp, setNewNoTelp] = useState("");
  const [newAktif, setNewAktif] = useState<"true" | "false">("true");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const savePetugas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: newNama,
          petugasId: newPetugasId,
          password: newPassword,
          role: "PETUGAS",
          noTelp: newNoTelp || null,
          aktif: newAktif === "true",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan petugas');
      }
      // 9. Perbaikan: 'newUser' harus bertipe 'User' asli
      const newUser: User = await response.json();
      setUsers((prev) => [newUser, ...prev]);
      setOpenDialog(false);
      setNewNama("");
      setNewPetugasId("");
      setNewNoTelp("");
      setNewAktif("true");
      setNewPassword("");
    } catch (error: any) {
      console.error('Error saving petugas:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  // --- Akhir 'savePetugas' ---

  // 10. Tambahkan UI untuk Loading/Error Halaman
  if (isPageLoading) {
    return (
      <div className="grid gap-6 p-6 text-center">
        <p>Mengambil data dashboard...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="grid gap-6 p-6 text-center text-red-600">
        <p>Error: {pageError}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Coba Muat Ulang
        </Button>
      </div>
    );
  }

  // --- Mulai JSX (SAMA PERSIS DENGAN KODE ASLI ANDA) ---
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan pelaporan PPSU Kelurahan
          </p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="rounded-xl">Buat Petugas</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Tambah Petugas</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                placeholder="Nama lengkap"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  value={newPetugasId}
                  onChange={(e) => setNewPetugasId(e.target.value)}
                  placeholder="ID Petugas (opsional)"
                />
                <Input
                  value={newNoTelp}
                  onChange={(e) => setNewNoTelp(e.target.value)}
                  placeholder="No. Telepon (opsional)"
                />
              </div>
              <Select
                value={newAktif}
                onValueChange={(v) => setNewAktif(v as "true" | "false")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Setel password awal (dummy)"
              />
            </div>
            <DialogFooter>
              <Button onClick={savePetugas} disabled={isLoading} className="rounded-xl">
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">PENDING</CardTitle>
            <CardDescription className="text-xs">
              Menunggu review admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countsByStatus.PENDING}</p>
            <div className="mt-2">
              <Progress value={pct.PENDING} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {pct.PENDING}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">DITERIMA</CardTitle>
            <CardDescription className="text-xs">
              Sudah diverifikasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countsByStatus.DITERIMA}</p>
            <div className="mt-2">
              <Progress value={pct.DITERIMA} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {pct.DITERIMA}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">DITOLAK</CardTitle>
            <CardDescription className="text-xs">
              Perlu perbaikan / duplikat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{countsByStatus.DITOLAK}</p>
            <div className="mt-2">
              <Progress value={pct.DITOLAK} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">
                {pct.DITOLAK}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Belum Lapor Hari Ini</CardTitle>
            <CardDescription>
              {belumLaporHariIni.length} petugas aktif belum mengirim laporan (
              {today})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {belumLaporHariIni.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Semua petugas aktif sudah melapor hari ini.
              </p>
            ) : (
              belumLaporHariIni.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{u.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.petugasId} • {u.noTelp || "No. telepon -"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Aktif</Badge>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      Ingatkan
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Laporan Terbaru</CardTitle>
            <CardDescription>8 laporan terakhir</CardDescription>
          </CardHeader>
          <CardContent className="w-full overflow-x-auto">
            {latest.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada laporan masuk.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Terbuat</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Bidang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Lokasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latest.map((r) => {
                    // 11. Perbaikan: 'pelapor' diambil dari data 'users'
                    //    'pelaporUser' HANYA ada di tipe 'LaporanWithPelapor'
                    const pelapor =
                      users.find((u) => u.id === r.pelaporUserId)?.nama ||
                      r.pelaporUserId;
                    const href = mapsHref(r.location as any);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap">
                          {fmtDateTime(r.createdAt as any)}
                        </TableCell>
                        <TableCell className="font-medium max-w-[260px] truncate">
                          {r.judul}
                        </TableCell>
                        <TableCell>{r.bidang}</TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant(r.statusReview)}>
                            {r.statusReview}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {pelapor}
                        </TableCell>
                        <TableCell>
                          {r.location ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
                            >
                              <Link2 className="h-4 w-4" />
                              Peta
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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

      <Card>
        <CardHeader>
          <CardTitle>Distribusi Status Laporan</CardTitle>
          <CardDescription>Total {totalReports} laporan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(["PENDING", "DITERIMA", "DITOLAK"] as ReviewStatus[]).map((s) => (
            <div key={s}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium">{s}</span>
                <span className="text-xs text-muted-foreground">
                  {s === "PENDING"
                    ? pct.PENDING
                    : s === "DITERIMA"
                      ? pct.DITERIMA
                      : pct.DITOLAK}
                  %
                </span>
              </div>
              <Progress
                value={
                  s === "PENDING"
                    ? pct.PENDING
                    : s === "DITERIMA"
                      ? pct.DITERIMA
                      : pct.DITOLAK
                }
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}