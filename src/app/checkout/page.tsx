"use client";

import * as React from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
// For Textarea, assuming shadcn provides one, otherwise fallback to HTML
// import { Textarea } from "@/components/ui/textarea"; // Uncomment if shadcn Textarea is added

interface Reservation {
  id: string;
  data_chegada: string;
  data_saida: string;
  status: string;
}

interface ChecklistState {
  gas: boolean;
  windows: boolean;
  trash: boolean;
}

export default function CheckoutPage() {
  const [currentReservation, setCurrentReservation] = React.useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = React.useState<string | null>(null);
  const [checklistState, setCheklistState] = React.useState<ChecklistState>({
    gas: false,
    windows: false,
    trash: false,
  });
  const [freeComment, setFreeComment] = React.useState<string>("");

  const fetchCurrentReservation = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const placeholderUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // TODO: Substituir pelo ID do usuário real

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const { data, error } = await supabase
      .from("reservas")
      .select("id, data_chegada, data_saida, status")
      .eq("usuario_responsavel", placeholderUserId)
      .eq("status", "checked_in") // Apenas reservas com check-in feito
      .lte("data_chegada", today) // Deve estar na reserva
      .gte("data_saida", today) // E a data de saída ainda não passou (ou é hoje)
      .limit(1);

    if (error) {
      console.error("Erro ao buscar reserva atual para checkout:", error);
      setError("Erro ao carregar sua reserva atual para check-out.");
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

  const handleCheckout = async () => {
    if (!currentReservation) return;

    setIsCheckingOut(true);
    setCheckoutSuccess(null);
    setError(null);

    // 1. Atualizar status da reserva
    const { error: updateError } = await supabase
      .from("reservas")
      .update({ status: "concluido" })
      .eq("id", currentReservation.id);

    if (updateError) {
      console.error("Erro ao atualizar status da reserva para concluído:", updateError);
      setError("Erro ao finalizar a reserva. Tente novamente.");
      setIsCheckingOut(false);
      return;
    }

    // 2. Inserir feedback
    const { error: feedbackError } = await supabase.from("feedbacks").insert([
      {
        reserva_id: currentReservation.id,
        checklist: checklistState, // Salva o estado do checklist como JSONB
        comentario_livre: freeComment,
      },
    ]);

    if (feedbackError) {
      console.error("Erro ao inserir feedback:", feedbackError);
      setError("Reserva finalizada, mas houve um erro ao salvar o feedback.");
    } else {
      setCheckoutSuccess("Check-out realizado com sucesso! Obrigado pelo feedback.");
      setCurrentReservation(null); // Remove a reserva da tela
      setCheklistState({ gas: false, windows: false, trash: false });
      setFreeComment("");
    }
    setIsCheckingOut(false);
  };

  const isCheckoutButtonDisabled = !(checklistState.gas && checklistState.windows && checklistState.trash) || isCheckingOut;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Página de Check-out</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-gray-600">Verificando reservas para check-out...</p>
      ) : currentReservation ? (
        <div className="border p-6 rounded-md shadow-lg text-center bg-white dark:bg-gray-800 w-full max-w-md">
          <p className="text-lg font-semibold mb-2">Sua reserva atual:</p>
          <p>De: {new Date(currentReservation.data_chegada).toLocaleDateString()}</p>
          <p>Até: {new Date(currentReservation.data_saida).toLocaleDateString()}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Status: {currentReservation.status}</p>

          <div className="mt-6 text-left">
            <h2 className="text-xl font-semibold mb-3">Checklist Obrigatório:</h2>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="gas"
                checked={checklistState.gas}
                onCheckedChange={(checked) => setCheklistState(prev => ({ ...prev, gas: checked as boolean }))}
              />
              <label htmlFor="gas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Desligou o gás?
              </label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="windows"
                checked={checklistState.windows}
                onCheckedChange={(checked) => setCheklistState(prev => ({ ...prev, windows: checked as boolean }))}
              />
              <label htmlFor="windows" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Fechou as janelas?
              </label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="trash"
                checked={checklistState.trash}
                onCheckedChange={(checked) => setCheklistState(prev => ({ ...prev, trash: checked as boolean }))}
              />
              <label htmlFor="trash" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tirou o lixo?
              </label>
            </div>
          </div>

          <div className="mt-6 text-left">
            <h2 className="text-xl font-semibold mb-3">Diário de Bordo (Observações):</h2>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Ex: 'A lâmpada da varanda queimou', 'Deixamos um fardo de água mineral', etc."
              value={freeComment}
              onChange={(e) => setFreeComment(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCheckout}
            disabled={isCheckoutButtonDisabled}
            className="mt-6 px-8 py-3 w-full"
          >
            {isCheckingOut ? "Finalizando..." : "Saindo..."}
          </Button>
          {checkoutSuccess && <p className="text-green-600 mt-4">{checkoutSuccess}</p>}
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma reserva com check-in ativo para check-out no momento.</p>
      )}
    </main>
  );
}
