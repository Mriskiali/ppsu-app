// src/app/(user)/profil/page.tsx
"use client";

// 1. Import hook yang diperlukan
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // <-- Import router

// 2. Ganti tipe mock dengan tipe Prisma
import type {
  Laporan as PrismaLaporan,
  User as PrismaUser
} from "@/generated/prisma"; // <-- Path yang benar

// 3. Import UI (pastikan semua ada)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 4. Hapus mock
// const CURRENT_USER_ID = "p2"; 

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserProfilPage() {
  const router = useRouter(); // <-- Inisialisasi router

  // 5. Buat state untuk data real
  const [me, setMe] = useState<PrismaUser | null>(null);
  const [myReportsToday, setMyReportsToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 6. Ambil data saat halaman dimuat
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Kita gunakan lagi API dashboard petugas
        const response = await fetch('/api/petugas/dashboard');
        if (!response.ok) {
          throw new Error('Gagal mengambil data profil');
        }
        const { user, reports } = await response.json();

        setMe(user); // Simpan data user

        // Hitung laporan hari ini (dari kode asli Anda)
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        const d = today.getDate();

        const todayCount = (reports || []).filter(
          (l: PrismaLaporan) => { // <-- Gunakan tipe Prisma
            const t = l.performedOn
              ? new Date(l.performedOn)
              : new Date(l.createdAt);
            return (
              t.getFullYear() === y && t.getMonth() === m && t.getDate() === d
            );
          }
        ).length;
        setMyReportsToday(todayCount);

        // Isi state dialog dengan data yang baru diambil
        setEditNama(user.nama || "");
        setEditTelp(user.noTelp || "");

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // '[]' = Hanya jalan sekali

  // State untuk Dialog "Ubah Data Diri"
  const [editOpen, setEditOpen] = useState(false);
  const [editNama, setEditNama] = useState("");
  const [editTelp, setEditTelp] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // State untuk Dialog "Ubah Kata Sandi"
  const [pwdOpen, setPwdOpen] = useState(false);
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [newPwd2, setNewPwd2] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  // 7. Modifikasi fungsi 'onLogout' (Keluar)
  const onLogout = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar?')) {
      return;
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Arahkan ke halaman login
      router.push('/login');
    } catch (err) {
      alert('Gagal logout, coba lagi.');
    }
  };

  // 8. Modifikasi fungsi 'saveProfile' (Ubah Data Diri)
  const saveProfile = async () => {
    if (!editNama.trim()) return;
    setSavingProfile(true);
    try {
      const response = await fetch('/api/profil/data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: editNama.trim(),
          noTelp: editTelp.trim() || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Gagal menyimpan profil');
      }

      const updatedUser = await response.json();
      setMe(updatedUser); // Update UI dengan data baru
      setEditOpen(false);

    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  // 9. Modifikasi fungsi 'savePassword' (Ubah Kata Sandi)
  const savePassword = async () => {
    if (!curPwd || !newPwd || newPwd !== newPwd2 || newPwd.length < 6) {
      alert('Pastikan semua field diisi, password baru minimal 6 karakter, dan konfirmasi password cocok.');
      return;
    }
    setSavingPwd(true);
    try {
      const response = await fetch('/api/profil/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ curPwd, newPwd }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Gagal memperbarui password');
      }

      // Sukses
      setPwdOpen(false);
      setCurPwd("");
      setNewPwd("");
      setNewPwd2("");
      alert("Kata sandi berhasil diperbarui.");

    } catch (err: any) {
      alert(`Error: ${err.message}`); // (misal: "Password saat ini salah")
    } finally {
      setSavingPwd(false);
    }
  };

  // 10. Tambahkan handler Loading & Error
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-screen-sm px-3 py-3 md:max-w-screen-md md:px-6 md:py-6 text-center">
        <p>Mengambil data profil...</p>
      </div>
    );
  }

  if (error || !me) {
    return (
      <div className="mx-auto w-full max-w-screen-sm px-3 py-3 md:max-w-screen-md md:px-6 md:py-6 text-center text-red-600">
        <p>Error: {error || "Gagal memuat profil"}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Muat Ulang
        </Button>
      </div>
    );
  }

  // --- SEMUA JSX ANDA DI BAWAH INI (TIDAK BERUBAH) ---
  // (Data 'me' dan 'myReportsToday' sekarang diambil dari state)
  return (
    <div className="mx-auto w-full max-w-screen-sm px-3 py-3 md:max-w-screen-md md:px-6 md:py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          Profil
        </h1>
        <p className="text-sm text-muted-foreground">
          Informasi dan pengaturan akun petugas.
        </p>
      </div>

      <Card className="border-border/60 bg-card">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Avatar className="size-12 rounded-2xl">
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary">
              {getInitials(me.nama)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base leading-tight">
              {me.nama ?? "Petugas"}
            </CardTitle>
            <CardDescription className="text-xs">
              ID: {me.petugasId ?? "-"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/buat-laporan" className="w-full">
              <Button className="w-full rounded-xl">Buat Laporan</Button>
            </Link>
            <Link href="/riwayat" className="w-full">
              <Button variant="outline" className="w-full rounded-xl">
                Riwayat
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-2xl border p-3 md:grid-cols-3">
            <div className="flex items-center justify-between md:block">
              <span className="text-sm text-muted-foreground">Status</span>
              <div className="md:mt-1.5">
                <Badge variant={me.aktif ? "default" : "secondary"}>
                  {me.aktif ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between md:block">
              <span className="text-sm text-muted-foreground">No. Telepon</span>
              <div className="md:mt-1.5 text-sm font-medium">
                {me.noTelp ?? "-"}
              </div>
            </div>
            <div className="flex items-center justify-between md:block">
              <span className="text-sm text-muted-foreground">
                Laporan Hari Ini
              </span>
              <div className="md:mt-1.5 text-sm font-medium">
                {myReportsToday}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setEditOpen(true)}
            >
              Ubah Data Diri
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setPwdOpen(true)}
            >
              Ubah Kata Sandi
            </Button>
            <Button onClick={onLogout} className="col-span-2 rounded-xl">
              Keluar
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Akun dibuat oleh admin. Kamu dapat memperbarui data diri dan kata sandi
        kapan saja.
      </p>

      {/* Dialog Ubah Data Diri */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Data Diri</DialogTitle>
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
              onClick={saveProfile}
              disabled={savingProfile || !editNama.trim()}
              className="rounded-xl"
            >
              {savingProfile ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Ubah Kata Sandi */}
      <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Kata Sandi</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="current">Kata sandi saat ini</Label>
              <Input
                id="current"
                type="password"
                value={curPwd}
                onChange={(e) => setCurPwd(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new">Kata sandi baru</Label>
              <Input
                id="new"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new2">Ulangi kata sandi baru</Label>
              <Input
                id="new2"
                type="password"
                value={newPwd2}
                onChange={(e) => setNewPwd2(e.target.value)}
                placeholder="Sama dengan di atas"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={savePassword}
              disabled={
                savingPwd ||
                !curPwd ||
                !newPwd ||
                newPwd.length < 6 ||
                newPwd !== newPwd2
              }
              className="rounded-xl"
            >
              {savingPwd ? "Memperbarui..." : "Perbarui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}