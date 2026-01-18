// src/app/login/page.tsx (atau src/app/page.tsx)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, User } from "lucide-react";

export default function SignInPage() {
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({ petugasId: "", password: "" });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

    // untuk memanggil API
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "ID Petugas atau password salah");
            }

            const { user } = await response.json();

            // 3. Arahkan (redirect) berdasarkan role
            if (user.role === "ADMIN") {
                router.push("/admin");
            } else {
                router.push("/");
            }

        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- JSX (Sudah disederhanakan) ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary/20 flex items-center justify-center p-4">
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_theme(colors.primary)_0%,_transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_theme(colors.accent)_0%,_transparent_50%)]" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                    <div className="absolute -top-2 -right-2 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-accent/10 rounded-full blur-lg" />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">
                                    P
                                </span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Selamat Datang
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Masuk ke Akun PPSU Anda
                        </p>
                    </div>

                    {/* Error */}
                    {errorMsg && (
                        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2 text-sm">
                            {errorMsg}
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-4" onSubmit={onSubmit}>

                        <div className="space-y-2">
                            <label
                                htmlFor="petugasId"
                                className="text-sm font-medium text-foreground"
                            >
                                ID Petugas
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="petugasId"
                                    name="petugasId"
                                    type="text"
                                    value={form.petugasId}
                                    onChange={onChange}
                                    className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                                    placeholder="Masukkan ID Petugas"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-foreground"
                            >
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={onChange}
                                    className="w-full pl-10 pr-12 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                                    placeholder="Masukkan kata sandi"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    aria-label={
                                        showPassword
                                            ? "Sembunyikan kata sandi"
                                            : "Tampilkan kata sandi"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? "Memproses..." : "Masuk"}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-6">
                    <p className="text-xs text-muted-foreground">
                        Dengan melanjutkan, Anda menyetujui{" "}
                        <a href="#" className="text-primary hover:text-primary/80">
                            Ketentuan Layanan
                        </a>{" "}
                        dan{" "}
                        <a href="#" className="text-primary hover:text-primary/80">
                            Kebijakan Privasi
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}