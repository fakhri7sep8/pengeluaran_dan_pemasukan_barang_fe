import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/lib/axiosClient";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export const useBarangModule = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const fetchBarang = async () => {
    const { data } = await axiosClient.get("/barang");
    return data;
  };

  const createBarang = async (payload: {
    kode: string;
    nama: string;
    satuan: string;
    items: string;
  }) => {
    const { data } = await axiosClient.post("/barang", payload);
    return data;
  };

    const updateBarang = async (payload: {
    id: number;
    data: {
      kode?: string;
      nama?: string;
      satuan?: string;
      items?: string;
      saldo?: number;
    };
  }) => {
    const { data } = await axiosClient.patch(
      `/barang/${payload.id}`,
      payload.data
    );
    return data;
  };

  function useGetAllBarang() {
    const { data, isLoading, refetch } = useQuery({
      queryKey: ["barang"],
      queryFn: fetchBarang,
    });

    return { data, isLoading, refetch };
  }

    function useUpdateBarang() {
    const { mutate, isPending } = useMutation({
      mutationFn: updateBarang,
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Barang "${data.nama}" berhasil diperbarui!`,
        });
        queryClient.invalidateQueries({ queryKey: ["barang"] });
      },
      onError: (err: any) => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: err?.response?.data?.message || "Terjadi kesalahan",
        });
      },
    });

    return { mutate, isPending };
  }


  function useCreateBarang() {
    const { mutate, isPending } = useMutation({
      mutationFn: createBarang,
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: `Barang "${data.nama}" berhasil ditambahkan!`,
        });
        queryClient.invalidateQueries({ queryKey: ["barang"] }); 
      },
      onError: (err: any) => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: err?.response?.data?.message || "Terjadi kesalahan",
        });
      },
    });

    return { mutate, isPending };
  }

  return { useGetAllBarang, useCreateBarang, useUpdateBarang };
};
