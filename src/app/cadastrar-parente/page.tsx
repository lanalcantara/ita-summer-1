"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastrarParentePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('1'); // Default to level 1
  const [avatarColor, setAvatarColor] = useState('#A1A1AA'); // Default to a neutral color

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRelativeData = {
      name,
      level: parseInt(level),
      avatarColor,
    };
    console.log('Novo parente cadastrado:', newRelativeData);
    // TODO: Integrar com o Supabase para salvar os dados
    router.push('/selecionar-usuario'); // Voltar para a tela de seleção de usuário após o cadastro
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center justify-center py-8 px-4 bg-white dark:bg-black rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-6">
          Cadastrar Novo Parente
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nome
            </label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nível (1-4)
            </label>
            <input
              type="number"
              id="level"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-800 text-black dark:text-white"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              min="1"
              max="4"
              required
            />
          </div>

          <div>
            <label htmlFor="avatarColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cor do Avatar
            </label>
            <input
              type="color"
              id="avatarColor"
              className="mt-1 block w-full h-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50 dark:bg-gray-800"
              value={avatarColor}
              onChange={(e) => setAvatarColor(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 bg-green-600 text-white rounded-md text-lg font-medium hover:bg-green-700 transition-colors"
          >
            Cadastrar
          </button>
          <button
            type="button"
            onClick={() => router.push('/selecionar-usuario')}
            className="w-full flex items-center justify-center py-3 px-4 bg-gray-400 text-white rounded-md text-lg font-medium hover:bg-gray-500 transition-colors mt-2"
          >
            Cancelar
          </button>
        </form>
      </main>
    </div>
  );
}
