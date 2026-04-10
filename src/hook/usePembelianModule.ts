import { axiosClient } from "@/lib/axiosClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export const usePembelianModule = () => {
  const router = useRouter();

  const fetchPembelian = async () => {
    const { data } = await axiosClient.get("/pembelian");
    return data;
  };

  const fetchDetailPembelian = async (id: number) => {
    const { data } = await axiosClient.get(`/pembelian/${id}`);
    return data;
  };

  const updatePembelian = async ({
    id,
    payload,
  }: {
    id: number;
    payload: any;
  }) => {
    const { data } = await axiosClient.patch(`/pembelian/${id}`, payload);
    return data;
  };

  const createPembelian = async (payload: any) => {
    const { data } = await axiosClient.post("/pembelian", payload);
    return data;
  };

  function useGetAllPembelian() {
    const { data, isLoading, refetch } = useQuery({
      queryKey: ["pembelian"],
      queryFn: fetchPembelian,
    });

    return { data, isLoading, refetch };
  }

  function useGetDetailPembelian(id: number) {
    const { data, isLoading, refetch } = useQuery({
      queryKey: ["pembelian", id],
      queryFn: () => fetchDetailPembelian(id),
      enabled: !!id, 
    });
    return { data, isLoading, refetch };
  }

  function useCreatePembelian() {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
      mutationFn: createPembelian,
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Pembelian berhasil dibuat",
        });
        queryClient.invalidateQueries({ queryKey: ["pembelian"] });
      },
      onError: (error: any) => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.response?.data?.message || "Terjadi kesalahan",
        });
      },
    });

    return { mutate, isPending };
  }

  function useUpdatePembelian() {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
      mutationFn: updatePembelian,
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Pembelian berhasil diperbarui",
        });
        queryClient.invalidateQueries({ queryKey: ["pembelian"] });
      },
      onError: (error: any) => {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: error.response?.data?.message || "Terjadi kesalahan",
        });
      },
    });
    return { mutate, isPending };
  }

  return { useGetAllPembelian, useCreatePembelian , useGetDetailPembelian, useUpdatePembelian  };
};
