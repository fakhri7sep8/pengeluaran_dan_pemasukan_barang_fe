"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthModule } from "@/hook/useAuthModule";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const { useLogin } = useAuthModule();
  const { mutate: login, isPending } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans px-4">
      <motion.main
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-8 w-full max-w-md p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
            Selamat Datang
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Masukkan akun Anda untuk mengakses dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <motion.input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            whileFocus={{ scale: 1.02 }}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div className="relative">
            <motion.input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              whileFocus={{ scale: 1.02 }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 dark:text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="flex justify-end">
            <span
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-blue-600 hover:underline cursor-pointer"
            >
              Lupa password?
            </span>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
          >
            {isPending ? "Loading..." : "Login"}
          </motion.button>
        </form>

        {/* <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Belum punya akun?{" "}
          <span
            onClick={() => router.push("/auth/register")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Daftar
          </span>
        </p> */}
      </motion.main>
    </div>
  );
};

export default LoginPage;
