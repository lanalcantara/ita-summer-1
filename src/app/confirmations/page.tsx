"use client";

import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface Reservation {
  id: string;
  data_chegada: string;
  data_saida: string;
  status: string;
}

export default function ConfirmationsPage() {
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const fetchUserReservations = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // TODO: Substituir 'placeholder_user_id' pelo ID do usuário real após implementação de login/seleção
    const placeholderUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    const { data, error } = await supabase
      .from("reservas")
      .select("id, data_chegada, data_saida, status")
      .eq("usuario_responsavel", placeholderUserId)
      .eq("status", "agendado") // Apenas reservas agendadas para confirmação
      .order("data_chegada", { ascending: true });

    if (error) {
      console.error("Erro ao buscar reservas do usuário:", error);
      setError("Erro ao carregar suas reservas para confirmação.");
    } else if (data) {
      setReservations(data);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchUserReservations();
  }, [fetchUserReservations]);

  const handleConfirmReservation = async (id: string) => {
    setUpdatingId(id);
    setError(null);
    const { error } = await supabase
      .from("reservas")
      .update({ status: "confirmado" })
      .eq("id", id);

    if (error) {
      console.error("Erro ao confirmar reserva:", error);
      setError("Erro ao confirmar reserva. Tente novamente.");
    } else {
      fetchUserReservations(); // Recarrega a lista para remover a reserva confirmada
    }
    setUpdatingId(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Minhas Reservas para Confirmação</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-gray-600">Carregando suas reservas...</p>
      ) : reservations.length === 0 ? (
        <p className="text-gray-600">Nenhuma reserva pendente para confirmação.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="border p-4 rounded-md shadow-sm bg-white dark:bg-gray-800">
              <p className="font-semibold">De: {new Date(reservation.data_chegada).toLocaleDateString()}</p>
              <p className="font-semibold">Até: {new Date(reservation.data_saida).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Status: {reservation.status}</p>
              <Button
                onClick={() => handleConfirmReservation(reservation.id)}
                disabled={updatingId === reservation.id}
                className="mt-4 w-full"
              >
                {updatingId === reservation.id ? "Confirmando..." : "Confirmar Ida"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
