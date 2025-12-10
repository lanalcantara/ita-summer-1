"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button"; // Importar o componente Button
import { supabase } from "@/lib/supabaseClient";
import { DateRange } from "react-day-picker";

export default function Home() {
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [reservations, setReservations] = React.useState<DateRange[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBooking, setIsBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = React.useState<string | null>(null);

  const fetchReservations = React.useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("reservas")
      .select("data_chegada, data_saida");

    if (error) {
      console.error("Erro ao buscar reservas:", error);
      setBookingError("Erro ao carregar reservas existentes.");
    } else if (data) {
      const disabledDateRanges = data.map(reserva => ({
        from: new Date(reserva.data_chegada),
        to: new Date(reserva.data_saida),
      }));
      setReservations(disabledDateRanges);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleBookReservation = async () => {
    setBookingError(null);
    setBookingSuccess(null);

    if (!range?.from || !range?.to) {
      setBookingError("Por favor, selecione um período completo (data de ida e volta).");
      return;
    }

    setIsBooking(true);
    // TODO: Substituir 'placeholder_user_id' pelo ID do usuário real após implementação de login/seleção
    const placeholderUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // Exemplo de UUID válido

    const { error } = await supabase.from("reservas").insert([
      {
        usuario_responsavel: placeholderUserId,
        data_chegada: range.from.toISOString().split("T")[0],
        data_saida: range.to.toISOString().split("T")[0],
        status: "agendado", // Status inicial
      },
    ]);

    if (error) {
      console.error("Erro ao fazer reserva:", error);
      setBookingError("Erro ao tentar fazer a reserva. Tente novamente.");
    } else {
      setBookingSuccess("Reserva realizada com sucesso!");
      setRange(undefined); // Limpa a seleção do calendário
      fetchReservations(); // Recarrega as reservas para atualizar o calendário
    }
    setIsBooking(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ItaSummer</h1>
      {isLoading ? (
        <p className="text-gray-600">Carregando datas...</p>
      ) : (
        <div className="flex flex-col items-center gap-4 border p-4 rounded-md shadow-lg">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={reservations}
            className="rounded-md"
          />
          {range?.from && range?.to && (
            <p className="text-center">
              Período selecionado: {range.from.toLocaleDateString()} a {range.to.toLocaleDateString()}
            </p>
          )}
          {bookingError && <p className="text-red-500 text-center">{bookingError}</p>}
          {bookingSuccess && <p className="text-green-600 text-center">{bookingSuccess}</p>}
          <Button
            onClick={handleBookReservation}
            disabled={!range?.from || !range?.to || isBooking}
            className="w-full sm:w-auto px-6 py-3"
          >
            {isBooking ? "Reservando..." : "Fazer Reserva"}
          </Button>
        </div>
      )}
    </main>
  );
}
