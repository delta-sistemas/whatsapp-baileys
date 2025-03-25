import { Pool } from 'pg';

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'localhost',
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Função para executar consultas SQL
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Exporta o pool para uso em outras partes da aplicação
export default pool;