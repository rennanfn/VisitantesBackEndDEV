//import { ParamAutorizUsu } from './../model/Cad_usuario';
import * as CryptoJS from 'crypto-js';
import { NextFunction, Request, Response } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Token } from '../Interfaces';
import { MySqlConnection } from '../model/MySqlConnection';
import CadUsuarioDB from '../modelDB/Cad_Usuario_DB';
import retornoPadrao from './retornoPadrao';
import { ErroGeneral } from '../model/ErrorGeneral';
import { consoleLog, pVerbose } from './consoleLog';

interface DataToRefresh {
  usuario: string;
  cod_usuario: string;
}

function encryptToken(obj: string): string {
  console.log(`Criptografando payload token...`, 0);
  const token_key =
    typeof process.env.TOKEN_KEY_VISITANTES !== 'undefined' ? process.env.TOKEN_KEY_VISITANTES : '';

  if (token_key === '') return '';

  const key = CryptoJS.enc.Utf8.parse(token_key);
  const iv = CryptoJS.enc.Utf8.parse(token_key);

  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(obj.toString()),
    key,
    {
      keySize: 128 / 8,
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  console.log(`Payload criptografado com sucesso.`, 0);
  return encrypted.toString();
}

function gerarToken(obj: Token): string {
  const secretKey =
    typeof process.env.TOKEN_SECRET_VISITANTES !== 'undefined'
      ? process.env.TOKEN_SECRET_VISITANTES
      : '';

  if (secretKey === '') return '';

  const corpoToken = JSON.stringify(obj);
  const newPayload = encryptToken(corpoToken);

  if (newPayload === '') return '';

  const tokenEncrypto = {
    tokenEnc: newPayload,
  };

  const tokenExpireTime = process.env.TOKEN_EXPIRES_IN_MINUTE ?? '60';
  const jwtOptions: jwt.SignOptions = {
    expiresIn: `${tokenExpireTime}m`,
  };

  const token = jwt.sign(tokenEncrypto, secretKey, jwtOptions);

  return token;
}

function decryptToken(encrypted: string): string {
  console.log(`Descriptografando payload token...`, 0);
  const token_key =
    typeof process.env.TOKEN_KEY_VISITANTES !== 'undefined' ? process.env.TOKEN_KEY_VISITANTES : '';

  if (token_key === '') return '';

  const key = CryptoJS.enc.Utf8.parse(token_key);
  const iv = CryptoJS.enc.Utf8.parse(token_key);

  const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key, {
    keySize: 128 / 8,
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  console.log(`Payload descriptografado com sucesso.`, 0);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Retorna se token pode ser atualizado ou não pelo tempo que ele expirou.
 * @param expiredAt Data e hora que o token expirou
 */
function isRefreshable(expiredAt: string): boolean {
  // Pega a diferença entre a hora atual e a hora que o token expirou,
  // divide por 60000 para transformar milisegundos em minuto.
  const timeDiff = Math.abs(+new Date() - +new Date(expiredAt)) / 60000;
  // Se o token expirou a menos de 10 minutos então pode ser atualizado.
  if (Math.trunc(timeDiff) <= 10) {
    return true;
  }
  return false;
}

/**
 * O token expira após 10m da sua data de criação, uma valor maior que isso não é um token válido
 * @param iat Data de criação
 * @param exp Data de expiração
 */

function validLifeTimeToken(iat: number, exp: number): boolean {
  const tokenExpireTime = process.env.TOKEN_EXPIRES_IN_MINUTE ?? '60';
  const tokenExpireInMs = Number(tokenExpireTime) * 60000;

  const timeDiff = Math.abs(+new Date(exp) - +new Date(iat)) * 1000;
  if (Math.trunc(timeDiff) <= tokenExpireInMs) return true;
  return false;
}

export const validaToken = async (
  req: Request,
  resp: Response,
  next: NextFunction,
) => {
  const userIp = req.userIp?.ip ?? '';
  const url = req.url ?? '';

  consoleLog('Validando Token...', pVerbose.aviso);
  const token = req.headers.authorization;
  if (typeof token === 'undefined') {
    consoleLog(`Request sem token`, pVerbose.erro);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, 'Sessão expirada. Realize a autenticação novamente.'),
      );
  }
  try {
    const secretKey =
      typeof process.env.TOKEN_SECRET_VISITANTES !== 'undefined'
        ? process.env.TOKEN_SECRET_VISITANTES
        : '';

    const payloadTokenEnc = jwt.verify(token, secretKey) as jwt.JwtPayload;

    const { iat, exp } = payloadTokenEnc;
    if (
      typeof iat === 'undefined' ||
      typeof exp === 'undefined' ||
      iat === null ||
      exp === null ||
      !validLifeTimeToken(iat, exp)
    ) {
      consoleLog(`Claims inválidas`, pVerbose.erro);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, 'Sessão Expirada. Realize a autenticação novamente'),
        );
    }

    const decoded = decryptToken(payloadTokenEnc.tokenEnc);
    if (decoded === '') {
      console.log(
        `Não foi possível descriptografar o token`,
        1,
        undefined,
        userIp,
      );
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão Expirada. Realize a autenticação novamente`),
        );
    }
    const tokenDados = JSON.parse(decoded) as Token;

    if (typeof tokenDados.cod_usuario === 'undefined') {
      console.log(`Token sem o parâmetro cod_usuario`, 1, undefined, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(
            1,
            `Sessão expirada. Realize a autenticação novamente.`,
          ),
        );
    }

    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retorno = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o MySQL',
        error,
      );
      return resp.status(400).json(retorno);
    }

    try {
      const cadUsuario = new CadUsuarioDB();
      const usuario = await cadUsuario.find(tokenDados.usuario, connection);

      if (usuario.length === 0) {
        console.log(
          `Usuário ${tokenDados.usuario} não encontrado`,
          1,
          undefined,
          userIp,
          tokenDados.cod_usuario,
        );
        return resp.status(403).json(retornoPadrao(1, `Sessão Expirada`));
      }

      req.customProperties = {
        usuario: tokenDados.usuario,
        cod_usuario: tokenDados.cod_usuario,
        token_data: tokenDados,
      };
    } catch (error) {
      console.log(
        `Erro ao buscar usuário - url: ${url}`,
        1,
        undefined,
        userIp,
        tokenDados.cod_usuario,
      );
      return resp.status(403).json(retornoPadrao(1, `Token Inválido`));
    } finally {
      MySqlConnection.closeConnection(connection);
    }
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      if (
        error?.name === 'TokenExpiredError' &&
        isRefreshable(String(error.expiredAt))
      ) {
        console.log(
          `Token expirado mas pode ser atualizado. Expirou em: ${error?.expiredAt} - url: ${url}`,
          1,
          undefined,
          userIp,
        );
        return resp
          .status(401)
          .json(
            retornoPadrao(
              1,
              `Sessão Expirada. Realize a autenticação novamente`,
            ),
          );
      }
      console.log(`Token expirado - url: ${url}`, 1, undefined, userIp);
      return resp
        .status(403)
        .json(
          retornoPadrao(1, `Sessão Expirada. Realize a autenticação novamente`),
        );
    }
    console.log(`Token Inválido - url: ${url}`, 1, undefined, userIp);
    return resp
      .status(403)
      .json(
        retornoPadrao(1, `Sessão Expirada. Realize a autenticação novamente`),
      );
  }
};

/*function gerarAutorizacoes(
  autorizacoesBD: ParamAutorizUsu[],
): ObjetoAcoes[] {
  console.log(`Montando lista de autorizações... `, 0);
  const listaAutoriz: ObjetoAcoes[] = [];

  autorizacoesBD.forEach(itemAutoriz => {
    // Retorna todos itens que contem o mesmo objeto itemAutorizacao
    const itensFiltro = autorizacoesBD.filter(
      value => value.objeto === itemAutoriz.objeto,
    );

    let nomeObjeto = ''; // Recebe o nome do objeto uma unica vez
    const arryAcoes: string[] = []; // Recebe todas as ações que pode realizar para o objeto

    // Verifica se já existe o objeto itemAutoriz na lista final e somente insere caso não exista
    if (!listaAutoriz.some(value => value.objeto === itemAutoriz.objeto)) {
      itensFiltro.forEach(itemFiltro => {
        arryAcoes.push(itemFiltro.acao);
        nomeObjeto = itemFiltro.objeto;
      });
      const itemResumido = {
        objeto: nomeObjeto,
        acoes: arryAcoes,
      };
      listaAutoriz.push(itemResumido);
    }
  });
  return listaAutoriz;
}*/

function getDataToRefresh(token: string, userIp: string): DataToRefresh | null {
  try {
    const secretKey =
      typeof process.env.TOKEN_SECRET_VISITANTES !== 'undefined'
        ? process.env.TOKEN_SECRET_VISITANTES
        : '';

    const payloadTokenEnc = jwt.verify(token, secretKey) as jwt.JwtPayload;
    if (payloadTokenEnc) {
      const tokenEncript = jwt.decode(token) as jwt.JwtPayload;
      if (typeof tokenEncript?.tokenEnc === 'undefined') return null;

      const tokenDecript = decryptToken(tokenEncript.tokenEnc);
      if (tokenDecript.length <= 0) return null;

      const { cod_usuario }: DataToRefresh = JSON.parse(tokenDecript);
      console.log(
        `Tentativa de refresh sem estar expirado - ip: ${userIp} - parceiro: ${cod_usuario} - token: ${payloadTokenEnc}`,
        1,
      );
      return null;
    }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      if (
        error?.name === 'TokenExpiredError' &&
        isRefreshable(String(error.expiredAt))
      ) {
        const tokenEncript = jwt.decode(token) as jwt.JwtPayload;
        if (typeof tokenEncript?.tokenEnc === 'undefined') return null;

        const tokenDecript = decryptToken(tokenEncript.tokenEnc);
        if (tokenDecript.length <= 0) return null;

        const { usuario, cod_usuario }: DataToRefresh =
          JSON.parse(tokenDecript);
        if (
          typeof usuario === 'undefined' ||
          typeof cod_usuario === 'undefined'
        ) {
          console.log(
            `Token sem usuario ou cod_usuario, refresh cancelado - ip: ${userIp}`,
            1,
          );
          return null;
        }
        return { usuario, cod_usuario };
      }
    }
  }
  return null;
}

export { decryptToken, encryptToken, gerarToken, getDataToRefresh };

