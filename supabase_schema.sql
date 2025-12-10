-- Tabela de Usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    nivel INT NOT NULL CHECK (nivel >= 1 AND nivel <= 4),
    cor_avatar TEXT
);

-- Tabela de Reservas
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_responsavel UUID REFERENCES usuarios(id),
    data_chegada DATE NOT NULL,
    data_saida DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'concluido')),
    convidados_nomes TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Feedbacks
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID NOT NULL REFERENCES reservas(id),
    checklist JSONB,
    comentario_livre TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Políticas de Segurança (Row Level Security - RLS)
-- Permite acesso público (anon key) para leitura e escrita em todas as tabelas por enquanto.

-- Habilitar RLS para as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso total (temporário)
CREATE POLICY "Public access for all" ON usuarios
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public access for all" ON reservas
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Public access for all" ON feedbacks
    FOR ALL
    USING (true)
    WITH CHECK (true);
