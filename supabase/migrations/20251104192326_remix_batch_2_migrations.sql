
-- Migration: 20251104190535
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255),
  tipo VARCHAR(50) DEFAULT 'usuario',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de permissões de acesso aos hotéis
CREATE TABLE IF NOT EXISTS usuario_hoteis (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  hotel VARCHAR(100) NOT NULL,
  UNIQUE(usuario_id, hotel)
);

-- Criar tabela de tokens de reset de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expira_em TIMESTAMP NOT NULL,
  usado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuario_hoteis_usuario_id ON usuario_hoteis(usuario_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO usuarios (email, senha, nome, tipo) 
VALUES ('admin@yoc.com', '$2a$10$rOiQCj9LH8b.X4Yh6z5rXeKqYmJ.4ZlLX9vW0pQHZxYh5mK9n.5Lm', 'Administrador', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Migration: 20251104191907
-- Ajustar estrutura para usar Supabase Auth
-- Remover tabela usuarios antiga e criar profiles
DROP TABLE IF EXISTS usuario_hoteis CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Criar tabela de perfis vinculada ao auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  tipo VARCHAR(50) DEFAULT 'usuario',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recriar tabela de hotéis vinculada ao auth.users
CREATE TABLE public.usuario_hoteis (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hotel VARCHAR(100) NOT NULL,
  UNIQUE(user_id, hotel)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_hoteis ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem inserir perfis"
  ON public.profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar perfis"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem deletar perfis"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Policies para usuario_hoteis
CREATE POLICY "Usuários podem ver seus próprios hotéis"
  ON public.usuario_hoteis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os hotéis"
  ON public.usuario_hoteis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Admins podem gerenciar hotéis"
  ON public.usuario_hoteis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Índices
CREATE INDEX idx_profiles_tipo ON public.profiles(tipo);
CREATE INDEX idx_usuario_hoteis_user_id ON public.usuario_hoteis(user_id);

-- Trigger para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, tipo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', new.email),
    COALESCE(new.raw_user_meta_data->>'tipo', 'usuario')
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
