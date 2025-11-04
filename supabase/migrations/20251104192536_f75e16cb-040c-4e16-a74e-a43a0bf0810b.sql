-- Remover todas as tabelas existentes (se existirem)
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.usuario_hoteis CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover funções antigas se existirem
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Criar tabela de usuários
CREATE TABLE public.usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255),
  tipo VARCHAR(50) DEFAULT 'usuario',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de permissões de acesso aos hotéis
CREATE TABLE public.usuario_hoteis (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES public.usuarios(id) ON DELETE CASCADE,
  hotel VARCHAR(100) NOT NULL,
  UNIQUE(usuario_id, hotel)
);

-- Criar tabela de tokens de reset de senha
CREATE TABLE public.password_reset_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
  usado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_usuarios_email ON public.usuarios(email);
CREATE INDEX idx_usuario_hoteis_usuario_id ON public.usuario_hoteis(usuario_id);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens(email);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO public.usuarios (email, senha, nome, tipo) 
VALUES ('admin@yoc.com', 'admin123', 'Administrador', 'admin');

-- Habilitar RLS
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_hoteis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Acesso service role usuários" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso service role hotéis" ON public.usuario_hoteis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso service role tokens" ON public.password_reset_tokens FOR ALL USING (true) WITH CHECK (true);

-- Função para atualizar updated_at
CREATE FUNCTION public.update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_usuarios_updated_at();