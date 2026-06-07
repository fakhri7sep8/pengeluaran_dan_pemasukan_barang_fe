/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/lib/axiosClient";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // 🌟 TAMBAHAN: Import library buat ngatur cookie

export const useAuthModule = function () {
  const router = useRouter();

  function registerUser(payload: any) {
    return axiosClient.post("/auth/register", payload);
  }

  function loginUser(payload: any) {
    return axiosClient.post("/auth/login", payload);
  }

  function refreshToken(payload: { refresh_token: string }) {
    return axiosClient.post("/auth/refresh", payload);
  }

  function forgotPassword(payload: { email: string }) {
    return axiosClient.post("/auth/forgot-password", payload);
  }

  function resetPassword(payload: { token: string; newPassword: string }) {
    return axiosClient.post("/auth/reset-password", payload);
  }

  function useRegister() {
    const { mutate, isPending } = useMutation({
      mutationFn: registerUser,
      onSuccess: function () {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Registrasi berhasil, silakan login.",
        });
        router.push("/auth/login");
      },
      onError: function (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.response?.data?.message || "Terjadi kesalahan saat registrasi.",
        });
      },
    });

    return { mutate, isPending };
  }

  function useLogin() {
    const { mutate, isPending } = useMutation({
      mutationFn: loginUser,
      onSuccess: function (response: any) { // 🌟 MODIFIKASI: Tangkap parameter response dari NestJS
        // Ambil access_token dan refresh_token dari response data backend lo
        const { access_token, refresh_token } = response.data;

        // 🌟 MODIFIKASI: Simpan access_token ke cookie biar middleware gak amnesia
        Cookies.set("access_token", access_token, { 
          expires: 1, // Cookie aktif selama 1 hari
          path: "/",  // Wajib '/' agar bisa dibaca di seluruh halaman Next.js
        });

        // (Opsional) Simpan juga refresh_token kalau sewaktu-waktu lo butuh di client side
        if (refresh_token) {
          Cookies.set("refresh_token", refresh_token, { expires: 7, path: "/" });
        }

        Swal.fire({
          icon: "success",
          title: "Login berhasil",
          text: "Selamat datang!",
        });
        
        router.push("/dashboard");
      },
      onError: function (error: any) {
        Swal.fire({
          icon: "error",
          title: "Login gagal",
          text: error.response?.data?.message || "Email atau password salah.",
        });
      },
    });

    return { mutate, isPending };
  }

  function useRefresh() {
    const { mutate } = useMutation({
      mutationFn: refreshToken,
      onSuccess: function () {
        Swal.fire({
          icon: "success",
          title: "Token berhasil diperbarui",
        });
      },
      onError: function () {
        Swal.fire({
          icon: "error",
          title: "Gagal memperbarui token",
        });
      },
    });

    return { mutate };
  }

  function useForgotPassword() {
    const router = useRouter();

    const { mutate , isPending} = useMutation({
      mutationFn: forgotPassword,
      onSuccess: function () {
        Swal.fire({
          icon: 'success',
          title: 'Email terkirim',
        }).then(() => {
          router.push('/auth/reset-password');
        });
      },
      onError: function (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.response?.data?.message || "Terjadi kesalahan.",
        });
      },
    });

    return { mutate , isPending };
  }

  function useResetPassword() {
    const { mutate , isPending } = useMutation({
      mutationFn: resetPassword,
      onSuccess: function () {
        Swal.fire({
          icon: "success",
          title: "Password berhasil diubah",
          text: "Silakan login dengan password baru.",
        });
        router.push("/auth/login");
      },
      onError: function (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.response?.data?.message || "Token tidak valid atau kadaluarsa.",
        });
      },
    });

    return { mutate , isPending};
  }

  return {
    useRegister,
    useLogin,
    useRefresh,
    useForgotPassword,
    useResetPassword,
  };
};