import { axiosClient } from "@/lib/axiosClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export const usePenjualanModule = () => {
  const router = useRouter();

  const fetchPenjualan = async () => {
    const { data } = await axiosClient.get("/penjualan");
    return data;
  };

  const fetchDetailPenjualan = async (id: number) => {
    const { data } = await axiosClient.get(`/penjualan/${id}`);
    return data;
  };

  const createPenjualan = async (payload: any) => {
    const { data } = await axiosClient.post("/penjualan", payload);
    return data;
  };

  function useGetAllPenjualan() {
    const { data, isLoading, refetch } = useQuery({
      queryKey: ["penjualan"],
      queryFn: fetchPenjualan,
    });

    return { data, isLoading, refetch };
  }

  const updatePenjualan = async ({ id, payload }: any) => {
    const { data } = await axiosClient.patch(`/penjualan/${id}`, payload);
    return data;
  };

 function useUpdatePenjualan(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePenjualan,
    onSuccess: () => {
      Swal.fire("Sukses", "Data penjualan diupdate", "success");
      queryClient.invalidateQueries({ queryKey: ["penjualan"] });
      onSuccessCallback?.();
    },
  });
}


  function useGetDetailPenjualan(id: number) {
    return useQuery({
      queryKey: ["penjualan", id],
      queryFn: () => fetchDetailPenjualan(id),
      enabled: !!id,
    });
  }

  function useCreatePenjualan() {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
      mutationFn: createPenjualan,
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Penjualan berhasil dibuat",
        });
        queryClient.invalidateQueries({ queryKey: ["penjualan"] });
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

  return {
    useGetAllPenjualan,
    useCreatePenjualan,
    useGetDetailPenjualan,
    useUpdatePenjualan,
  };
};
