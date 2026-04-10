"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Swal from "sweetalert2";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

 const handleLogout = async () => {
  const result = await Swal.fire({
    title: "Yakin mau logout?",
    text: "Kamu akan keluar dari halaman ini",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Logout",
    cancelButtonText: "Batal",
    confirmButtonColor: "#DC2626",
    cancelButtonColor: "#2563EB",
  });

  if (!result.isConfirmed) return;

  try {
    await fetch("http://localhost:3232/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    Swal.fire({
      icon: "success",
      title: "Logout berhasil",
      text: "kamu berhasil logout",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Logout gagal",
      text: "Coba lagi",
    });
  } finally {
    setTimeout(() => {
      router.replace("/auth/login");
    }, 1500);
  }
};

  const menus = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/barang", label: "Barang", icon: Boxes },
    { href: "/dashboard/pembelian", label: "Pembelian", icon: ShoppingCart },
    { href: "/dashboard/penjualan", label: "Penjualan", icon: ShoppingCart },
    { href: "/dashboard/laporan", label: "Laporan", icon: FileText },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-gray-900">PT SAKKA</h1>
        <p className="text-xs text-gray-500">Kreasindo Perkasa</p>
      </div>

      <nav className="flex flex-col gap-1">
        {menus.map((item, i) => {
          const active = pathname === item.href;

          return (
            <Link key={i} href={item.href} onClick={() => setOpen(false)}>
              <motion.div
                whileHover={{ x: 6 }}
                transition={{ type: "spring", stiffness: 260 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
                  ${
                    active
                      ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <motion.button
        whileHover={{ x: 6 }}
        transition={{ type: "spring", stiffness: 260 }}
        onClick={handleLogout}
        className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50"
      >
        <LogOut size={18} />
        <span className="text-sm font-medium">Logout</span>
      </motion.button>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-100 overflow-x-hidden">
      <aside className="hidden md:flex w-60 shrink-0 bg-white border-r flex-col px-4 py-6">

        <SidebarContent />
      </aside>

      <AnimatePresence>
  {open && (
    <div className="fixed inset-0 z-50 md:hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/30"
      />

      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-0 left-0 w-64 h-full bg-white px-6 py-8 flex flex-col"
      >
        <SidebarContent />
      </motion.aside>
    </div>
  )}
</AnimatePresence>


      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                Dashboard
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                Monitoring stok & transaksi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">Admin Gudang</p>
              <p className="text-xs text-gray-500">PT Sakka Kreasindo</p>
            </div>

            <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center font-semibold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
