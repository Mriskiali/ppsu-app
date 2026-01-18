// src/app/(admin)/petugas/page.tsx
"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import type {
  Laporan as PrismaLaporan,
  User as PrismaUser,
  ReviewStatus,
  Bidang
} from "@/generated/prisma";

// Import komponen UI
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/emptyState";
import { Separator } from "@/components/ui/separator";

const statusBadgeVariant = (s: ReviewStatus) =>
  s === "PENDING" ? "secondary" : s === "DITERIMA" ? "default" : "destructive";

type LaporanWithPelapor = PrismaLaporan & {
  pelaporUser: {
    id: string;
    nama: string;
    petugasId: string;
  } | null;
};

export default function AdminPetugas() {
  const [q, setQ] = useState("");
  const [aktif, setAktif] = useState<"ALL" | "true" | "false">("ALL");
  const [openId, setOpenId] = useState<string | null>(null);

  const [PETUGAS, setPETUGAS] = useState<PrismaUser[]>([]);
  const [LAPORAN, setLAPORAN] = useState<LaporanWithPelapor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fungsi 'fetch'
  const fetchPetugasAndLaporan = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // --- PERBAIKAN DI SINI ---
      // Hapus semua object 'headers'. Browser akan mengirim cookie secara otomatis.
      const [usersRes, reportsRes] = await Promise.all([
        fetch("/api/getalluser?role=PETUGAS"),
        fetch("/api/getalllaporan"),
      ]);
      // --- AKHIR PERBAIKAN ---

      if (!usersRes.ok || !reportsRes.ok) {
        throw new Error("Gagal mengambil data dari server");
      }
      const usersData: PrismaUser[] = await usersRes.json();
      const reportsData: LaporanWithPelapor[] = await reportsRes.json();
      setPETUGAS(usersData);
      setLAPORAN(reportsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPetugasAndLaporan();
  }, [fetchPetugasAndLaporan]);

  // ... (useMemo 'data' dan 'statsByPetugas' tidak berubah) ...
  const data = useMemo(() => {
    return PETUGAS.filter((p) =>
      aktif === "ALL" ? true : String(p.aktif) === aktif
    ).filter((p) =>
      q
        ? p.nama.toLowerCase().includes(q.toLowerCase()) ||
        p.petugasId.toLowerCase().includes(q.toLowerCase())
        : true
    );
  }, [q, aktif, PETUGAS]);

  const statsByPetugas = (id: string) => {
    const reports = LAPORAN.filter((l) => l.pelaporUserId === id);
    const counts = { PENDING: 0, DITERIMA: 0, DITOLAK: 0, TOTAL: reports.length } as Record<string, number>;
    reports.forEach((r) => (counts[r.statusReview] = (counts[r.statusReview] ?? 0) + 1));
    const today = new Date();
    const start = new Date(today); start.setHours(0, 0, 0, 0);
    const end = new Date(today); end.setHours(23, 59, 59, 999);
    const todayReports = reports.filter((r) => { const d = new Date(r.createdAt); return d >= start && d <= end; });
    const lastReports = [...reports].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, 5);
    return { counts, todayCount: todayReports.length, lastReports };
  };

  // ... (State dan fungsi untuk dialog Edit/Pwd tidak berubah) ...
  const [selectedUser, setSelectedUser] = useState<PrismaUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPwdOpen, setIsPwdOpen] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editTelp, setEditTelp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openEditDialog = (user: PrismaUser) => {
    setSelectedUser(user);
    setEditNama(user.nama);
    setEditTelp(user.noTelp || "");
    setIsEditOpen(true);
  };
  const openPwdDialog = (user: PrismaUser) => {
    setSelectedUser(user);
    setNewPassword("");
    setIsPwdOpen(true);
  };

  // --- PERBAIKAN: Hapus 'Authorization' header ---
  const handleUpdateProfile = async () => {
    if (!selectedUser || !editNama.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json', // <-- Biarkan ini
          // 'Authorization': ... // <-- Hapus ini
        },
        body: JSON.stringify({
          nama: editNama.trim(),
          noTelp: editTelp.trim() || null,
        }),
      });
      if (!response.ok) { throw new Error('Gagal memperbarui profil'); }
      setIsEditOpen(false);
      await fetchPetugasAndLaporan();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PERBAIKAN: Hapus 'Authorization' header ---
  const handleResetPassword = async () => {
    if (!selectedUser || newPassword.length < 6) { /* ... */ return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json', // <-- Biarkan ini
          // 'Authorization': ... // <-- Hapus ini
        },
        body: JSON.stringify({ newPassword }),
      });
      if (!response.ok) { throw new Error('Gagal mereset password'); }
      setIsPwdOpen(false);
      alert('Password petugas berhasil direset!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PERBAIKAN: Hapus 'Authorization' header ---
  const handleToggleStatus = async (user: PrismaUser) => {
    const newStatus = !user.aktif;
    const action = newStatus ? "mengaktifkan" : "menonaktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${action} petugas ${user.nama}?`)) { return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json', // <-- Biarkan ini
          // 'Authorization': ... // <-- Hapus ini
        },
        body: JSON.stringify({ aktif: newStatus }),
      });
      if (!response.ok) { throw new Error(`Gagal ${action} petugas`); }
      await fetchPetugasAndLaporan();
      setOpenId(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PERBAIKAN: Hapus 'Authorization' header ---
  const handleDeletePetugas = async (user: PrismaUser) => {
    if (!confirm(`PERINGATAN: Anda akan menghapus ${user.nama} secara permanen. Semua laporan terkait akan ikut terhapus. Lanjutkan?`)) { return; }
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        // headers: { 'Authorization': ... } // <-- Hapus ini
      });
      if (!response.ok) { throw new Error('Gagal menghapus petugas'); }
      await fetchPetugasAndLaporan();
      setOpenId(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- Akhir Perbaikan ---

  // ... (handler loading & error halaman tidak berubah) ...
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Mengambil data petugas...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Error: {error}</p>
        <Button onClick={fetchPetugasAndLaporan}>Coba Lagi</Button>
      </div>
    );
  }

  // --- KODE JSX ANDA (SAMA SEKALI TIDAK SAYA UBAH DARI SEBELUMNYA) ---
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Petugas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau ID petugas..."
          />
          <Select value={aktif} onValueChange={(v) => setAktif(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Status aktif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua</SelectItem>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {data.length === 0 ? (
        <EmptyState
          title="Tidak ada petugas"
          description="Ubah filter atau kata kunci."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((p) => {
            const s = statsByPetugas(p.id);
            const belumHariIni = s.todayCount === 0;
            return (
              <button
                key={p.id}
                onClick={() => setOpenId(p.id)}
                className="text-left transition hover:-translate-y-0.5"
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{p.nama}</CardTitle>
                      <Badge variant={p.aktif ? "default" : "secondary"}>
                        {p.aktif ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.petugasId}
                    </p>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p className="text-muted-foreground">
                      Telp: {p.noTelp ?? "-"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Total: {s.counts.TOTAL}</Badge>
                      <Badge variant="default">
                        Diterima: {s.counts.DITERIMA ?? 0}
                      </Badge>
                      <Badge variant="secondary">
                        Pending: {s.counts.PENDING ?? 0}
                      </Badge>
                      <Badge variant="destructive">
                        Ditolak: {s.counts.DITOLAK ?? 0}
                      </Badge>
                    </div>
                    {belumHariIni ? (
                      <div className="rounded-md border border-dashed px-2 py-1 text-xs text-amber-700 bg-amber-50">
                        Belum ada laporan hari ini
                      </div>
                    ) : (
                      <div className="rounded-md border px-2 py-1 text-xs text-emerald-700 bg-emerald-50">
                        Laporan hari ini: {s.todayCount}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {/* Sheet (Panel Samping) */}
      <Sheet open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Ringkasan Petugas</SheetTitle>
          </SheetHeader>
          {openId &&
            (() => {
              const me = PETUGAS.find((x: PrismaUser) => x.id === openId);
              if (!me) return null;

              const st = statsByPetugas(openId);
              return (
                <div className="mt-4 space-y-6">
                  <div>
                    <p className="text-sm font-semibold">{me.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {me.petugasId} • {me.aktif ? "Aktif" : "Nonaktif"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => openEditDialog(me)}
                      disabled={isSubmitting}
                    >
                      Ubah Data Diri
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => openPwdDialog(me)}
                      disabled={isSubmitting}
                    >
                      Reset Password
                    </Button>
                  </div>

                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={me.aktif ? "secondary" : "default"}
                      className="rounded-xl"
                      onClick={() => handleToggleStatus(me)}
                      disabled={isSubmitting}
                    >
                      {me.aktif ? "Nonaktifkan Petugas" : "Aktifkan Petugas"}
                    </Button>
                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => handleDeletePetugas(me)}
                      disabled={isSubmitting}
                    >
                      Hapus Petugas
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg border p-2">
                      <p className="text-[11px] text-muted-foreground">Total</p>
                      <p className="text-lg font-bold">{st.counts.TOTAL}</p>
                    </div>
                    <div className="rounded-lg border p-2">
                      <p className="text-[11px] text-muted-foreground">
                        Diterima
                      </p>
                      <p className="text-lg font-bold">
                        {st.counts.DITERIMA ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border p-2">
                      <p className="text-[11px] text-muted-foreground">
                        Pending
                      </p>
                      <p className="text-lg font-bold">
                        {st.counts.PENDING ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border p-2">
                      <p className="text-[11px] text-muted-foreground">
                        Ditolak
                      </p>
                      <p className="text-lg font-bold">
                        {st.counts.DITOLAK ?? 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">
                      5 Laporan Terakhir
                    </p>
                    <div className="space-y-2">
                      {st.lastReports.map((l) => (
                        <div key={l.id} className="rounded-lg border p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">
                              {l.judul}
                            </span>
                            <Badge variant={statusBadgeVariant(l.statusReview)}>
                              {l.statusReview}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {l.bidang}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => console.log("Kirim notifikasi ke", me.nama)}
                    className="w-full rounded-xl"
                    disabled={isSubmitting}
                  >
                    Kirim Notifikasi
                  </Button>
                </div>
              );
            })()}
        </SheetContent>
      </Sheet>

      {/* Dialog Edit Profil */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Data Diri: {selectedUser?.nama}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={editNama}
                onChange={(e) => setEditNama(e.target.value)}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="telp">No. Telepon</Label>
              <Input
                id="telp"
                value={editTelp}
                onChange={(e) => setEditTelp(e.target.value)}
                placeholder="08xxxxxxxxxx"
                inputMode="tel"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateProfile}
              disabled={isSubmitting || !editNama.trim()}
              className="rounded-xl"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reset Password */}
      <Dialog open={isPwdOpen} onOpenChange={setIsPwdOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password: {selectedUser?.nama}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="new-pwd">Password Baru</Label>
              <Input
                id="new-pwd"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleResetPassword}
              disabled={isSubmitting || newPassword.length < 6}
              className="rounded-xl"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Password Baru"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}