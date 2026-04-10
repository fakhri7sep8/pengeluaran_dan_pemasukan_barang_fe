"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthModule } from "@/hook/useAuthModule";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const { useForgotPassword } = useAuthModule();
  const { mutate, isPending } = useForgotPassword();

  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email });
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
            Lupa Password
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Masukkan email akun Anda. Kami akan kirimkan link untuk reset password.
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

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 transition"
          >
            {isPending ? "Mengirim..." : "Kirim Email Reset"}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Ingat password?{" "}
          <span
            onClick={() => router.push("/auth/login")}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Kembali ke Login
          </span>
        </p>
      </motion.main>
    </div>
  );
};

export default ForgotPasswordPage;
