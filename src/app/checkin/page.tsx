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

export default function CheckInPage() {
  const [currentReservation, setCurrentReservation] = React.useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);
  const [checkInSuccess, setCheckInSuccess] = React.useState<string | null>(null);

  const fetchCurrentReservation = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const placeholderUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // TODO: Substituir pelo ID do usuário real

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const { data, error } = await supabase
      .from("reservas")
      .select("id, data_chegada, data_saida, status")
      .eq("usuario_responsavel", placeholderUserId)
      .eq("status", "confirmado")
      .lte("data_chegada", today) // Check-in pode ser no dia ou depois da data de chegada
      .gte("data_saida", today) // A reserva deve ainda estar ativa (não saiu)
      .limit(1); // Apenas uma reserva ativa por vez para simplicidade

    if (error) {
      console.error("Erro ao buscar reserva atual:", error);
      setError("Erro ao carregar sua reserva atual.");
    } else if (data && data.length > 0) {
      setCurrentReservation(data[0]);
    } else {
      setCurrentReservation(null);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchCurrentReservation();
  }, [fetchCurrentReservation]);

  const handleCheckIn = async () => {
    if (!currentReservation) return;

    setIsCheckingIn(true);
    setCheckInSuccess(null);
    setError(null);

    const { error } = await supabase
      .from("reservas")
      .update({ status: "checked_in" }) // Novo status para indicar check-in
      .eq("id", currentReservation.id);

    if (error) {
      console.error("Erro ao fazer check-in:", error);
      setError("Erro ao registrar o check-in. Tente novamente.");
    } else {
      setCheckInSuccess("Check-in realizado com sucesso!");
      fetchCurrentReservation(); // Atualiza o estado da reserva
    }
    setIsCheckingIn(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ItaSummer - Check-in</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-gray-600">Verificando reservas...</p>
      ) : currentReservation ? (
        <div className="border p-6 rounded-md shadow-lg text-center bg-white dark:bg-gray-800">
          <p className="text-lg font-semibold mb-2">Sua reserva atual:</p>
          <p>De: {new Date(currentReservation.data_chegada).toLocaleDateString()}</p>
          <p>Até: {new Date(currentReservation.data_saida).toLocaleDateString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Status: {currentReservation.status}</p>

          {currentReservation.status === "checked_in" ? (
            <p className="text-green-600 mt-4 font-semibold">Você já fez o check-in!</p>
          ) : (
            <Button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="mt-6 px-8 py-3"
            >
              {isCheckingIn ? "Registrando Check-in..." : "Cheguei!"}
            </Button>
          )}
          {checkInSuccess && <p className="text-green-600 mt-4">{checkInSuccess}</p>}
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma reserva confirmada para check-in no momento.</p>
      )}
    </main>
  );
}
