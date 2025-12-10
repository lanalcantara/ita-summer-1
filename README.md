# 🏖️ ItaSummer - Gerenciador da Casa de Praia

Este é o repositório do projeto **ItaSummer**, um Web App (PWA) simples para agendamento, check-in/out e histórico de uso da casa de praia da família, focado na transparência entre os membros e na gestão de insumos.

## 🎯 Objetivo

O objetivo principal é criar uma ferramenta centralizada que organize o uso da casa, evitando conflitos de agendamento e garantindo que todos saibam o estado da casa (ex: nível do gás, limpeza, itens quebrados) após cada uso.

## ✨ Funcionalidades Principais

O sistema foi desenhado com base nos seguintes fluxos:

1.  **Seleção de Usuário:**
    *   O usuário seleciona seu nome de uma lista pré-cadastrada de membros da família.
    *   O sistema "lembra" do usuário para futuras visitas (usando LocalStorage).
    *   Permite o cadastro de novos membros fixos.

2.  **Agendamento:**
    *   Um calendário visual exibe as datas livres, ocupadas e pendentes de confirmação.
    *   Um formulário permite a criação de uma nova reserva, com data de ida e volta e seleção dos participantes.

3.  **Confirmação:**
    *   A reserva entra em um estado "pré-agendado".
    *   O usuário deve confirmar a ida manualmente para efetivar a reserva.

4.  **Fluxo de Estadia (Check-in / Check-out):**
    *   **Check-in:** Um simples botão "Cheguei!" registra a data e hora da chegada.
    *   **Check-out:** Ao sair, o usuário preenche um checklist obrigatório (gás, janelas, lixo) e pode deixar um feedback em texto no "Diário de Bordo".

5.  **Histórico:**
    *   Uma lista cronológica exibe quem foi, quando foi e qual o feedback deixado, criando um registro transparente do uso da casa.

## 🛠️ Stack de Tecnologias

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Banco de Dados:** [Supabase](https://supabase.io/) (PostgreSQL)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/)
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **Utilitários:** `date-fns`, `react-day-picker`, `clsx`, `tailwind-merge`

## 🚀 Como Rodar o Projeto Localmente

**1. Clonar o repositório:**
```bash
git clone https://github.com/Kevengrf/ita-summer.git
cd ita-summer
```

**2. Instalar as dependências:**
Certifique-se de ter o Node.js instalado.
```bash
npm install
```

**3. Configurar as Variáveis de Ambiente:**
*   Renomeie o arquivo `.env.local.example` para `.env.local` (se existir) ou crie um novo arquivo `.env.local`.
*   Adicione suas chaves do Supabase, que você pode encontrar em *Project Settings > API* no seu painel do Supabase.
```
NEXT_PUBLIC_SUPABASE_URL=SUA_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
```

**4. Configurar o Banco de Dados:**
*   Copie o conteúdo do arquivo `supabase_schema.sql` e execute-o no **SQL Editor** do seu projeto no Supabase para criar as tabelas necessárias.

**5. Rodar o Servidor de Desenvolvimento:**
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação.
