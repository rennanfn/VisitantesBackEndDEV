import { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import ShortUniqueId from 'short-unique-id';
import { ReturnDefault } from '../Interfaces';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import retornoPadrao from '../utils/retornoPadrao';
import { iVisitante } from './../model/Cad_visitante';
import { convertDate2String } from '../utils/dateNow';

export default class CadVisitanteDB {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na bibliteca mysql
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no mysql
    consoleLog(`Erro ao buscar visitante, rows = undefined`, pVerbose.erro);
    return new Error(`Erro ao buscar visitante, rows = undefined`);
  }

  async insert(
    obj: iVisitante,
    conn: Connection,
  ): Promise<ReturnDefault> {
    const { randomUUID } = new ShortUniqueId({
      dictionary: 'hex',
      length: 10,
    });
    obj.cod_visitante = randomUUID();
    const sql = `INSERT INTO visitantes_cadastro (cod_visitante, nome, rg, empresa, data_criacao, usuario_criacao)
                 VALUES (?,?,?,?,?,?)`;
    const values = [
      obj.cod_visitante,
      obj.nome,
      obj.rg,
      obj.empresa,
      obj.data_criacao,
      obj.usuario_criacao,
    ];

      try {
        const result = await conn.query<ResultSetHeader>(sql, values);
        if (result) {
          consoleLog(
            `Visitante inserido com sucesso!`,
            pVerbose.aviso,
          );
          return Promise.resolve(
            retornoPadrao(0, `Visitante inserido com sucesso!`),
          );
        } else {
          consoleLog(`Erro ao inserir visitante`, pVerbose.erro);
          return Promise.resolve(retornoPadrao(1, `Erro ao inserir visitante`));
        }
      } catch (error) {
        consoleLog(`Erro ao inserir visitante: ${error}`, pVerbose.erro);
        return Promise.reject(error);
      }
  }

  async update(
    obj: iVisitante,
    conn: Connection,
  ): Promise<ReturnDefault> {
    const sql = `UPDATE visitantes_cadastro SET cod_visitante = ?, nome = ?, rg = ?, empresa = ?, usuario_criacao = ? WHERE cod_visitante = ?`;
    const values = [
      obj.cod_visitante,
      obj.nome,
      obj.rg,
      obj.empresa,
      obj.usuario_criacao,
      obj.cod_visitante,
    ];
    try {
      const result = await conn.query<ResultSetHeader>(sql, values);
      if (!result) {
        consoleLog(`Visitante não encontrado!`, pVerbose.erro);
        return Promise.reject(retornoPadrao(1, `Visitante não encontrado!`));
      }
        consoleLog(
          `Visitante atualizado com sucesso!`,
          pVerbose.aviso,
        );
        return Promise.resolve(
          retornoPadrao(
            0,
            `Visitante atualizado com sucesso!`,
          ),
        );
    } catch (error) {
      consoleLog(`Erro ao atualizar visitante: ${error}`, pVerbose.erro);
      return Promise.reject(error);
    }
  }

  async show(conn: Connection): Promise<iVisitante[]> {
      const sql = `SELECT * FROM visitantes_cadastro ORDER BY nome asc`;
    try{
      const [rows] = await conn.query<RowDataPacket[]>(sql);
      if(!Array.isArray(rows)){
        return Promise.reject(this.rowsUndefined());
      }
      const vistante = rows.map((formatObject: RowDataPacket) => {
        return {
          ...formatObject,
          data_criacao: convertDate2String(new Date(formatObject.data_criacao))
        } as iVisitante;
      });
      return Promise.resolve(vistante);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async find(
    cod_visitante: string,
    conn: Connection
  ): Promise<iVisitante> {
    const sql = `SELECT * FROM visitantes_cadastro
                WHERE cod_visitante = ?`;
    try {
      const [rows] = await conn.query<RowDataPacket[]>(sql, [cod_visitante]);

      if(!Array.isArray(rows)){
        return Promise.reject(this.rowsUndefined());
      }
      const visitante = {
        ...rows[0]
      } as iVisitante;

      return Promise.resolve(visitante);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
