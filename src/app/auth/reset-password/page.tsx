"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthModule } from "@/hook/useAuthModule";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { useResetPassword } = useAuthModule();
  const { mutate: resetPassword, isPending } = useResetPassword();

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword) return;

    resetPassword({ token: code, newPassword});
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
            Reset Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Masukkan kode 6-digit yang dikirim ke email dan password baru Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <motion.input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Kode 6-digit"
            maxLength={6}
            required
            whileFocus={{ scale: 1.02 }}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <div className="relative">
            <motion.input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password Baru"
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

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
          >
            {isPending ? "Loading..." : "Reset Password"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Ingat password?{" "}
          <span
            onClick={() => router.push("/auth/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </motion.main>
    </div>
  );
};

export default ResetPasswordPage;
