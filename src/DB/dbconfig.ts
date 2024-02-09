export default {
  host: process.env.DB_DEV_HOST_VISITANTES, // Endereço do servidor do MySQL
  user: process.env.DB_DEV_USER_NAME_VISITANTES, // Nome de usuário do MySQL
  password: process.env.DB_DEV_USER_PASSWORD_VISITANTES, // Senha do MySQL
  database: process.env.DB_DEV_CONNECT_DESCRIPTOR_VISITANTES, // Nome do banco de dados MySQL
  waitForConnections: true, // Aguardar por conexões quando o pool estiver esgotado
  connectionLimit: 120, // Limite máximo de conexões no pool
};
