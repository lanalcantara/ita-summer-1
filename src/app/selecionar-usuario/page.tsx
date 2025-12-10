export default function SelecionarUsuarioPage() {
  const dummyUsers = [
    { id: '1', name: 'João da Silva' },
    { id: '2', name: 'Maria Souza' },
    { id: '3', name: 'Pedro Santos' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center justify-center py-8 px-4 bg-white dark:bg-black rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50 mb-6">
          Quem é você?
        </h1>

        <div className="w-full space-y-4 mb-6">
          {dummyUsers.map((user) => (
            <button
              key={user.id}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-md text-lg font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => console.log(`Usuário selecionado: ${user.name}`)}
            >
              {user.name}
            </button>
          ))}
        </div>

        <button
          className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-md text-lg font-medium hover:bg-blue-700 transition-colors"
          onClick={() => console.log('Navegar para cadastro de novo parente')}
        >
          Cadastrar novo parente
        </button>
      </main>
    </div>
  );
}