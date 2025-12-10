"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase'; // Import Supabase client

export default function CadastrarParentePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('1'); // Default to level 1
  const [loading, setLoading] = useState(false); // New loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nome: name, nivel: parseInt(level) }]);

    if (error) {
      console.error('Erro ao cadastrar parente:', error);
      alert('Erro ao cadastrar parente. Tente novamente.');
    } else {
      console.log('Novo parente cadastrado com sucesso:', data);
      alert('Parente cadastrado com sucesso!');
      router.push('/selecionar-usuario'); // Voltar para a tela de seleção de usuário após o cadastro
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-center">Cadastrar Novo Parente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Nome</Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="level">Nível (1-4)</Label>
              <Input
                type="number"
                id="level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                min="1"
                max="4"
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/selecionar-usuario')}
              className="w-full mt-2"
              disabled={loading}
            >
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
