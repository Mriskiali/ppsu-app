"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  MapPin,
  X,
  CheckCircle2,
  Navigation,
  Clock as ClockIcon,
  Link2,
} from "lucide-react";

type Bidang = "KERUSAKAN" | "KEBERSIHAN" | "LAINNYA";

type LaporanForm = {
  judul: string;
  deskripsi: string;
  bidang: Bidang | "";
  location: string;
  fotoSesudah: string[];
  performedAt: string;
};

const now = new Date();
const isoDateTimeLocal = new Date(
  now.getTime() - now.getTimezoneOffset() * 60000
)
  .toISOString()
  .slice(0, 16);

const toPerformedOn = (dtLocal: string) => dtLocal.split("T")[0];

export default function UserLaporanBaru() {
  const [form, setForm] = useState<LaporanForm>({
    judul: "",
    deskripsi: "",
    bidang: "",
    location: "",
    fotoSesudah: [],
    performedAt: isoDateTimeLocal,
  });

  // --- PERUBAHAN 1: State untuk file asli & loading ---
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // --- Akhir Perubahan 1 ---

  const [errors, setErrors] = useState<
    Partial<Record<keyof LaporanForm | "performedOn", string>>
  >({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // --- PERUBAHAN 2: Modifikasi 'handleFileUpload' ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);

      // 1. Buat URL preview untuk ditampilkan di <img>
      const newFiles = fileArray.map((f) => URL.createObjectURL(f));
      setForm((prev) => ({
        ...prev,
        fotoSesudah: [...prev.fotoSesudah, ...newFiles],
      }));

      // 2. Simpan file ASLI untuk di-upload
      setFilesToUpload((prevFiles) => [...prevFiles, ...fileArray]);

      setErrors((prev) => ({ ...prev, fotoSesudah: undefined }));
    }
  };
  // --- Akhir Perubahan 2 ---

  // --- PERUBAHAN 3: Modifikasi 'removePhoto' ---
  const removePhoto = (index: number) => {
    // 1. Hapus URL preview
    setForm((prev) => ({
      ...prev,
      fotoSesudah: prev.fotoSesudah.filter((_, i) => i !== index),
    }));
    // 2. Hapus file ASLI
    setFilesToUpload((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  // --- Akhir Perubahan 3 ---

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    // TODO: Ganti dengan Geolocation API
    setTimeout(() => {
      const lat = -6.197;
      const lng = 106.84;
      setForm((prev) => ({ ...prev, location: `geo:${lat},${lng}` }));
      setIsGettingLocation(false);
      setErrors((prev) => ({ ...prev, location: undefined }));
    }, 900);
  };

  // --- PERUBAHAN 4: Modifikasi 'validate' ---
  const validate = (): boolean => {
    const newErrors: Partial<
      Record<keyof LaporanForm | "performedOn", string>
    > = {};
    if (!form.judul.trim()) newErrors.judul = "Judul wajib diisi";
    else if (form.judul.trim().length < 5)
      newErrors.judul = "Judul minimal 5 karakter";
    if (!form.bidang) newErrors.bidang = "Bidang harus dipilih";
    if (!form.deskripsi.trim()) newErrors.deskripsi = "Deskripsi wajib diisi";
    else if (form.deskripsi.trim().length < 10)
      newErrors.deskripsi = "Deskripsi minimal 10 karakter";

    // Cek file asli, bukan URL preview
    if (filesToUpload.length === 0)
      newErrors.fotoSesudah = "Minimal 1 foto sesudah harus diunggah";

    if (!form.location.trim()) newErrors.location = "Lokasi wajib diisi";
    if (!form.performedAt)
      newErrors.performedAt = "Waktu pelaksanaan wajib diisi";
    const performedOn = form.performedAt ? toPerformedOn(form.performedAt) : "";
    if (!performedOn) newErrors.performedOn = "Tanggal pelaksanaan tidak valid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // --- Akhir Perubahan 4 ---

  // --- PERUBAHAN 5: Modifikasi 'handleSubmit' (Sambungan API) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return; // Jalankan validasi

    setIsSubmitting(true); // Mulai loading

    try {
      // 1. Buat FormData
      const formData = new FormData();

      // 2. Tambahkan semua field teks
      formData.append("judul", form.judul.trim());
      formData.append("deskripsi", form.deskripsi.trim());
      formData.append("bidang", form.bidang as Bidang);
      formData.append("location", form.location.trim());
      formData.append("performedAt", new Date(form.performedAt).toISOString());

      // 3. Tambahkan semua file dari state 'filesToUpload'
      for (const file of filesToUpload) {
        formData.append("fotoSesudah", file);
      }

      // 4. Kirim FormData ke backend
      const response = await fetch("/api/laporan", {
        method: "POST",
        body: formData,
        // headers: { 'Authorization': 'Bearer <TOKEN_JWT_PETUGAS>' } // Nanti
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal membuat laporan");
      }

      // 5. Sukses
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        // Reset form
        setForm({
          judul: "",
          deskripsi: "",
          bidang: "",
          location: "",
          fotoSesudah: [],
          performedAt: isoDateTimeLocal,
        });
        setFilesToUpload([]); // Reset state file
      }, 1500);

    } catch (error: any) {
      console.error("Submit Laporan Error:", error);
      setErrors({ judul: `Error: ${error.message}` }); // Tampilkan error di form
    } finally {
      setIsSubmitting(false); // Selesai loading
    }
  };
  // --- Akhir Perubahan 5 ---

  const isMapsUrl = (s: string) =>
    /^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.[a-z.]+\/maps)/i.test(
      s
    );

  // ==========================================================
  // === KODE JSX ANDA (LENGKAP) DIMULAI DARI SINI ===
  // ==========================================================
  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-8">
      <div className="sticky md:static top-0 z-10 bg-card md:bg-none md:border-0 border-b border-border px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            {/* <button
              type="button"
              onClick={() => history.back()}
              className="sm:hidden inline-flex w-10 h-10 rounded-lg hover:bg-muted items-center justify-center"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button> */}
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Buat Laporan
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Laporkan pekerjaan yang sudah Anda lakukan
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl space-y-4 sm:space-y-6"
        >
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-2">
              Judul <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => {
                setForm((p) => ({ ...p, judul: e.target.value }));
                setErrors((prev) => ({ ...prev, judul: undefined }));
              }}
              className={`w-full px-3 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.judul ? "border-destructive" : "border-input"
                } disabled:opacity-50`}
              placeholder="Contoh: Perbaikan tutup got Jl. Melati 3"
              disabled={isSubmitting}
            />
            {errors.judul ? (
              <p className="mt-1 text-xs text-destructive">{errors.judul}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Minimal 5 karakter
              </p>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">
              Bidang Pekerjaan <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(["KERUSAKAN", "KEBERSIHAN", "LAINNYA"] as Bidang[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, bidang: b }));
                    setErrors((prev) => ({ ...prev, bidang: undefined }));
                  }}
                  className={`py-3 px-3 rounded-lg text-sm font-medium transition-all ${form.bidang === b
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-foreground hover:bg-muted"
                    } disabled:opacity-50`}
                  disabled={isSubmitting}
                >
                  {b}
                </button>
              ))}
            </div>
            {errors.bidang && (
              <p className="text-xs text-destructive mt-2">{errors.bidang}</p>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">
              Deskripsi Pekerjaan <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, deskripsi: e.target.value }));
                setErrors((prev) => ({ ...prev, deskripsi: undefined }));
              }}
              rows={5}
              className={`w-full px-3 py-3 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none ${errors.deskripsi ? "border-destructive" : "border-input"
                } disabled:opacity-50`}
              placeholder="Contoh: Tutup got patah ukuran 50x50cm diganti. Area disterilkan, aliran air dicek normal."
              disabled={isSubmitting}
            />
            <div className="mt-2 flex items-center justify-between">
              {errors.deskripsi ? (
                <p className="text-xs text-destructive">{errors.deskripsi}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Minimal 10 karakter
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {form.deskripsi.length} karakter
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Lokasi <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation || isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                >
                  <Navigation
                    className={`h-3.5 w-3.5 ${isGettingLocation ? "animate-pulse" : ""
                      }`}
                  />
                  {isGettingLocation ? "Mencari..." : "Lokasi Saya"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, location: e.target.value }));
                    setErrors((prev) => ({ ...prev, location: undefined }));
                  }}
                  className={`w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.location ? "border-destructive" : ""
                    } disabled:opacity-50`}
                  placeholder="geo:-6.197,106.840 atau tempel tautan Google Maps"
                  disabled={isSubmitting}
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.location}
                  </p>
                )}
              </div>

              {form.location ? (
                <a
                  href={
                    isMapsUrl(form.location)
                      ? form.location
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        form.location.replace(/^geo:/i, "")
                      )}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted ${isSubmitting ? "pointer-events-none opacity-50" : ""
                    }`}
                >
                  <Link2 className="h-4 w-4" />
                  Buka Peta
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Pratinjau peta
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">
              Waktu Pelaksanaan
            </label>
            <div>
              <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>Waktu pelaksanaan tugas</span>
              </div>
              <input
                type="datetime-local"
                value={form.performedAt}
                onChange={(e) => {
                  setForm((p) => ({ ...p, performedAt: e.target.value }));
                  setErrors((prev) => ({
                    ...prev,
                    performedAt: undefined,
                    performedOn: undefined,
                  }));
                }}
                className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors.performedAt ? "border-destructive" : "border-input"
                  } disabled:opacity-50`}
                required
                disabled={isSubmitting}
              />
              {(errors.performedAt || errors.performedOn) && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.performedAt || errors.performedOn}
                </p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">
              Foto Sesudah <span className="text-destructive">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="photo-upload"
              disabled={isSubmitting}
            />
            {form.fotoSesudah.length === 0 ? (
              <label
                htmlFor="photo-upload"
                className={`flex flex-col items-center justify-center gap-3 w-full py-8 sm:py-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${errors.fotoSesudah
                  ? "border-destructive hover:border-destructive/80"
                  : "border-border hover:border-primary"
                  } ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Ambil atau pilih foto
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Format: JPG/PNG (Maks. 5MB)
                  </p>
                </div>
              </label>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {form.fotoSesudah.map((foto, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square bg-muted rounded-lg overflow-hidden group"
                    >
                      <img
                        src={foto}
                        alt={`Foto sesudah ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className={`absolute top-2 right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ${isSubmitting ? "hidden" : ""
                          }`}
                        aria-label="Hapus foto"
                        disabled={isSubmitting}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
                        Foto {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <label
                  htmlFor="photo-upload"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-lg hover:bg-muted cursor-pointer transition-colors ${isSubmitting ? "pointer-events-none opacity-50" : ""
                    }`}
                >
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Tambah foto</span>
                </label>
              </div>
            )}
            {errors.fotoSesudah && (
              <p className="text-xs text-destructive mt-2">
                {errors.fotoSesudah}
              </p>
            )}
          </div>

          <div className="sticky bottom-0 -mx-4 border-t border-border bg-background px-4 pt-4 pb-4 sm:static sm:mx-0 sm:border-t-0 sm:px-0 sm:pt-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 sm:shadow-none disabled:opacity-60"
            >
              <CheckCircle2 className="h-5 w-5" />
              {isSubmitting ? "Mengirim Laporan..." : "Kirim Laporan"}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 animate-in slide-in-from-top">
          <div className="flex min-w-[280px] items-center gap-3 rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-lg">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Laporan berhasil dikirim!</p>
              <p className="text-xs opacity-90">Menunggu review admin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}