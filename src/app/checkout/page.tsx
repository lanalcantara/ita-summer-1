"use client";

import * as React from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; // Assumindo que Textarea foi adicionado via shadcn

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

interface ChecklistState {
  gas: boolean;
  windows: boolean;
  trash: boolean;
}

export default function CheckoutPage() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
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

  React.useEffect(() => {
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

      const today = new Date().toISOString().split("T")[0];

      const { data, error: fetchError } = await supabase
        .from("reservas")
        .select("id, data_chegada, data_saida, status")
        .eq("usuario_responsavel", user.id)
        .eq("status", "checked_in")
        .limit(1);

      if (fetchError) {
        console.error("Erro ao buscar reserva atual para checkout:", fetchError);
        setError("Erro ao carregar sua reserva atual para check-out.");
      } else if (data && data.length > 0) {
        setCurrentReservation(data[0]);
      } else {
        setCurrentReservation(null);
      }
      setIsLoading(false);
    };

    fetchCurrentReservation();
  }, []);

  const handleCheckout = async () => {
    if (!currentReservation) return;

    setIsCheckingOut(true);
    setCheckoutSuccess(null);
    setError(null);

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

    const { error: feedbackError } = await supabase.from("feedbacks").insert([
      {
        reserva_id: currentReservation.id,
        checklist: checklistState,
        comentario_livre: freeComment,
      },
    ]);

    if (feedbackError) {
      console.error("Erro ao inserir feedback:", feedbackError);
      setError("Reserva finalizada, mas houve um erro ao salvar o feedback.");
    } else {
      setCheckoutSuccess("Check-out realizado com sucesso! Obrigado pelo feedback.");
      setCurrentReservation(null);
      setCheklistState({ gas: false, windows: false, trash: false });
      setFreeComment("");
    }
    setIsCheckingOut(false);
  };

  const isCheckoutButtonDisabled = !(checklistState.gas && checklistState.windows && checklistState.trash) || isCheckingOut;

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-600">Verificando reservas para check-out...</p>;
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
        <div className="border p-6 rounded-md shadow-lg text-center bg-white dark:bg-gray-800 w-full max-w-md">
          <p className="text-lg font-semibold mb-2">Sua reserva atual, {currentUser?.name}:</p>
          <p>De: {new Date(currentReservation.data_chegada).toLocaleDateString()}</p>
          <p>Até: {new Date(currentReservation.data_saida).toLocaleDateString()}</p>

          <div className="mt-6 text-left">
            <h2 className="text-xl font-semibold mb-3">Checklist Obrigatório:</h2>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox id="gas" checked={checklistState.gas} onCheckedChange={(checked) => setCheklistState(prev => ({ ...prev, gas: checked as boolean }))} />
              <label htmlFor="gas">Desligou o gás?</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox id="windows" checked={checklistState.windows} onCheckedChange={(checked) => setCheklistState(prev => ({ ...prev, windows: checked as boolean }))} />
              <label htmlFor="windows">Fechou as janelas?</label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox id="trash" checked={checklistState.trash} onCheckedChange={(checked) => setCheklistState(prev => ({ ...prev, trash: checked as boolean }))} />
              <label htmlFor="trash">Tirou o lixo?</label>
            </div>
          </div>

          <div className="mt-6 text-left">
            <h2 className="text-xl font-semibold mb-3">Diário de Bordo (Observações):</h2>
            <Textarea
              placeholder="Ex: 'A lâmpada da varanda queimou', 'Deixamos um fardo de água mineral', etc."
              value={freeComment}
              onChange={(e) => setFreeComment(e.target.value)}
            />
          </div>

          <Button onClick={handleCheckout} disabled={isCheckoutButtonDisabled} className="mt-6 w-full">
            {isCheckingOut ? "Finalizando..." : "Saindo..."}
          </Button>
          {checkoutSuccess && <p className="text-green-600 mt-4">{checkoutSuccess}</p>}
        </div>
      );
    }
    
    return <p className="text-gray-600">Olá, {currentUser?.name}. Nenhuma reserva com check-in ativo para check-out no momento.</p>;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">ItaSummer - Check-out</h1>
      {renderContent()}
    </main>
  );
}
