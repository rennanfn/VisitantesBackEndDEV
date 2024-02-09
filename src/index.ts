import { Ipware } from '@fullerstack/nax-ipware';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import { createPool } from 'mysql2/promise';
import dbconfig from './DB/dbconfig';
import { MySqlConnection } from './model/MySqlConnection';
import { routes } from './routes/index';
import { requireOrigin } from './utils/RequireOrigins';
import { consoleLog, pVerbose } from './utils/consoleLog';

// URLS liberadas para acessarem a api, devem ser separadas por ;
const origensPermitidas = process.env.CORS_URL_PERMITIDAS_VISITANTES || '';

const expressPort = Number(process.env.PORTA_EXPRESS_VISITANTES);

if (!expressPort) {
  console.log('Falta variável de ambiente PORTAEXPRESS');
  process.exit(1);
}

const corsOptions: CorsOptions = {
  origin: origensPermitidas.split(';'),
  optionsSuccessStatus: 200,
};

async function init() {
  try {
    console.log('Aguarde, criando conexão', pVerbose.aviso);
    MySqlConnection.pool = createPool(dbconfig);
    console.log('Conexão MySQL Criada', pVerbose.aviso);
  } catch (error) {
    console.log(`Erro ao iniciar conexão com o MySQL ${error}`, pVerbose.erro);
  }
}

const ipware = new Ipware();
const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
// Adiciona o IP do cliente nas requisições;
app.use((req, res, next) => {
  const ipInfo = ipware.getClientIP(req);
  if (ipInfo !== null) {
    req.userIp = {
      ip: ipInfo.ip,
      isPublic: ipInfo.isPublic,
    };
  }
  next();
});
app.use(requireOrigin);

app.use(routes);

// Se o ambiente for DEV inicia sem certificado, mas se não for obrigado ter o certificado SSL
if (process.env.NODE_ENV === 'DEV') {
  app.listen(expressPort, () => {
    consoleLog(`Server iniciado na porta ${expressPort}`, pVerbose.aviso);
    init();
  });
}

