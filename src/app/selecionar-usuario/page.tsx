"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'; // Import useState
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase'; // Import Supabase client

interface User {
  id: string;
  name: string;
  level: number;
}

export default function SelecionarUsuarioPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]); // State to store users
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('usuarios').select('id, nome, nivel');

      if (error) {
        console.error('Error fetching users:', error);
        setError('Erro ao carregar usuários.');
        setLoading(false);
      } else {
        // Map data to match the User interface, assuming 'nome' maps to 'name'
        setUsers(data.map(user => ({ id: user.id, name: user.nome, level: user.nivel })));
        setLoading(false);
      }
    };

    fetchUsers();

    // Opcional: checar se já existe um usuário selecionado ao carregar a página
    const selectedUser = localStorage.getItem('selectedUser');
    if (selectedUser) {
      console.log('Usuário já selecionado:', JSON.parse(selectedUser).name);
      // Você pode optar por redirecionar automaticamente ou exibir o usuário selecionado
      // router.push('/');
    }
  }, []);

  const handleUserSelection = (user: User) => {
    localStorage.setItem('selectedUser', JSON.stringify(user));
    console.log(`Usuário selecionado e salvo no localStorage: ${user.name}`);
    router.push('/'); // Navegar para a página principal após a seleção
  };

  const handleNewRelative = () => {
    router.push('/cadastrar-parente'); // Navegar para a página de cadastro de novo parente
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p>Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-center">Quem é você?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full space-y-4 mb-6">
            {users.length > 0 ? (
              users.map((user) => (
                <Button
                  key={user.id}
                  className="w-full"
                  variant="outline"
                  onClick={() => handleUserSelection(user)}
                >
                  {user.name}
                </Button>
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhum usuário encontrado. Cadastre um novo!</p>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleNewRelative}
          >
            Cadastrar novo parente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}