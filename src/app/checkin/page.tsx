"use client";

import * as React from "react";
import Link from "next/link"; // Importar Link para o redirecionamento
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface Reservation {
  id: string;
  data_chegada: string;
  data_saida: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  level: number;
}

export default function CheckInPage() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [currentReservation, setCurrentReservation] = React.useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = React.useState(false);
  const [checkInSuccess, setCheckInSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 1. Obter usuário do localStorage
    const userString = localStorage.getItem("selectedUser");
    if (!userString) {
      setError("Nenhum usuário selecionado. Por favor, identifique-se primeiro.");
      setIsLoading(false);
      return;
    }
    const user: User = JSON.parse(userString);
    setCurrentUser(user);

    const fetchCurrentReservation = async () => {
      setIsLoading(true);
      setError(null);

      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

      // 2. Usar o ID do usuário real na busca
      const { data, error: fetchError } = await supabase
        .from("reservas")
        .select("id, data_chegada, data_saida, status")
        .eq("usuario_responsavel", user.id)
        .eq("status", "confirmado")
        .lte("data_chegada", today)
        .gte("data_saida", today)
        .limit(1);

      if (fetchError) {
        console.error("Erro ao buscar reserva atual:", fetchError);
        setError("Erro ao carregar sua reserva atual.");
      } else if (data && data.length > 0) {
        setCurrentReservation(data[0]);
      } else {
        setCurrentReservation(null);
      }
      setIsLoading(false);
    };

    fetchCurrentReservation();
  }, []);

  const handleCheckIn = async () => {
    if (!currentReservation) return;

    setIsCheckingIn(true);
    setCheckInSuccess(null);
    setError(null);

    const { error: updateError } = await supabase
      .from("reservas")
      .update({ status: "checked_in" })
      .eq("id", currentReservation.id);

    if (updateError) {
      console.error("Erro ao fazer check-in:", updateError);
      setError("Erro ao registrar o check-in. Tente novamente.");
    } else {
      setCheckInSuccess("Check-in realizado com sucesso!");
      // Atualiza o estado localmente para refletir a mudança imediatamente
      setCurrentReservation(prev => prev ? { ...prev, status: "checked_in" } : null);
    }
    setIsCheckingIn(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-600">Verificando reservas...</p>;
    }

    if (error) {
      return (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          {error.includes("identifique-se") && (
            <Link href="/selecionar-usuario" passHref>
              <Button>Ir para a seleção de usuário</Button>
            </Link>
          )}
        </div>
      );
    }

    if (currentReservation) {
      return (
        <div className="border p-6 rounded-md shadow-lg text-center bg-white dark:bg-gray-800">
          <p className="text-lg font-semibold mb-2">Sua reserva atual, {currentUser?.name}:</p>
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
      );
    }

    return (
      <p className="text-gray-600">Olá, {currentUser?.name}. Nenhuma reserva confirmada para check-in no momento.</p>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ItaSummer - Check-in</h1>
      {renderContent()}
    </main>
  );
}
