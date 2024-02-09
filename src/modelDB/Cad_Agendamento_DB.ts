import { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import ShortUniqueId from 'short-unique-id';
import { ReturnDefault } from '../Interfaces';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import { convertDate2String } from '../utils/dateNow';
import retornoPadrao from '../utils/retornoPadrao';
import { iAgendamento } from './../model/Cad_agendamento';

export default class CadAgendamentoDB {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na biblioteca mysql
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no mysql
    consoleLog(`Erro ao buscar agendamento, rows = undefined`, pVerbose.erro);
    return new Error(`Erro ao buscar agendamento, rows = undefined`);
  }

  async insert(
    obj: iAgendamento,
    conn: Connection,
  ): Promise<ReturnDefault> {
    const { randomUUID } = new ShortUniqueId({
      dictionary: 'hex',
      length: 10,
    });
    obj.cod_agendamento = randomUUID();
    const sql = `INSERT INTO visitantes_agendamento (cod_agendamento, visitante, data, hora_agendada, hora_entrada, hora_saida, observacao, status, data_criacao, usuario_criacao)
                 VALUES (?,?,?,?,?,?,?,?,?,?)`;
    const values = [
      obj.cod_agendamento,
      obj.visitante,
      obj.data,
      obj.hora_agendada,
      obj.hora_entrada,
      obj.hora_saida,
      obj.observacao,
      obj.status,
      obj.data_criacao,
      obj.usuario_criacao
    ];

      try {
        const result = await conn.query<ResultSetHeader>(sql, values);
        if (result) {
          consoleLog(
            `Agendamento inserido com sucesso!`,
            pVerbose.aviso,
          );
          return Promise.resolve(
            retornoPadrao(0, `Agendamento inserido com sucesso!`),
          );
        } else {
          consoleLog(`Erro ao inserir agendamento`, pVerbose.erro);
          return Promise.resolve(retornoPadrao(1, `Erro ao inserir agendamento`));
        }
      } catch (error) {
        consoleLog(`Erro ao inserir agendamento: ${error}`, pVerbose.erro);
        return Promise.reject(error);
      }
  }

  async update(
    obj: iAgendamento,
    conn: Connection,
  ): Promise<ReturnDefault> {
    const sql = `UPDATE visitantes_agendamento SET cod_agendamento = ?, visitante = ?, data = ?, hora_agendada = ?, hora_entrada = ?, hora_saida = ?, observacao = ?, status = ?, usuario_criacao = ? WHERE cod_agendamento = ?`;
    const values = [
      obj.cod_agendamento,
      obj.visitante,
      obj.data,
      obj.hora_agendada,
      obj.hora_entrada,
      obj.hora_saida,
      obj.observacao,
      obj.status,
      obj.usuario_criacao,
      obj.cod_agendamento,
    ];
    try {
      const result = await conn.query<ResultSetHeader>(sql, values);
      if (!result) {
        consoleLog(`Agendamento não encontrado!`, pVerbose.erro);
        return Promise.reject(retornoPadrao(1, `Agendamento não encontrado!`));
      }
        consoleLog(
          `Agendamento atualizado com sucesso!`,
          pVerbose.aviso,
        );
        return Promise.resolve(
          retornoPadrao(
            0,
            `Agendamento atualizado com sucesso!`,
          ),
        );
    } catch (error) {
      consoleLog(`Erro ao atualizar agendamento: ${error}`, pVerbose.erro);
      return Promise.reject(error);
    }
  }

  async show(conn: Connection): Promise<iAgendamento[]> {
      const sql = `SELECT * FROM visitantes_agendamento ORDER BY cod_agendamento asc`;
    try{
      const [rows] = await conn.query<RowDataPacket[]>(sql);
      if(!Array.isArray(rows)){
        return Promise.reject(this.rowsUndefined());
      }
      const agendamento = rows.map((formatObject: RowDataPacket) => {
        return {
          ...formatObject,
          data: convertDate2String(new Date(formatObject.data)),
          data_criacao: convertDate2String(new Date(formatObject.data_criacao)),
        } as iAgendamento;
      });
      return Promise.resolve(agendamento);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async find(
    cod_agendamento: string,
    conn: Connection
  ): Promise<iAgendamento> {
    const sql = `SELECT * FROM visitantes_agendamento
                WHERE cod_agendamento = ?`;
    try {
      const [rows] = await conn.query<RowDataPacket[]>(sql, [cod_agendamento]);

      if(!Array.isArray(rows)){
        return Promise.reject(this.rowsUndefined());
      }

      // const agendamento = rows.map((formatObject: RowDataPacket) => {
      //   return {
      //     ...formatObject,
      //   } as iAgendamento;
      // });

      const agendamento = {
        ...rows[0],
        data: convertDate2String(new Date(rows[0].data)),
      } as iAgendamento;

      return Promise.resolve(agendamento);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async findByData(
    data: string,
    conn: Connection
  ): Promise<iAgendamento[]> {
    const sql = `SELECT * FROM visitantes_agendamento
                WHERE data = ?`;
    try {
      const [rows] = await conn.query<RowDataPacket[]>(sql, [data]);

      if(!Array.isArray(rows)){
        return Promise.reject(this.rowsUndefined());
      }

      const agendamento = rows.map((formatObject: RowDataPacket) => {
        return {
          ...formatObject,
          data: convertDate2String(new Date(formatObject.data)),
          data_criacao: convertDate2String(new Date(formatObject.data_criacao)),
        } as iAgendamento;
      });

      return Promise.resolve(agendamento);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete(
    cod_agendamento: string,
    conn: Connection,
  ): Promise<ReturnDefault> {
      const sql =
        'DELETE FROM visitantes_agendamento WHERE cod_agendamento = ?';

      try {
        const rows = await conn.query(sql, [cod_agendamento]);

        if (!rows) {
          consoleLog(
            `Erro ao deletar agendamento`,
            pVerbose.erro,
          );
          return Promise.reject(
            retornoPadrao(1, `Erro ao deletar agendamento`),
          );

        } else {
          consoleLog(`Agendamento deletado com sucesso!`, pVerbose.aviso);
          return Promise.resolve(retornoPadrao(0, `Agendamento deletado com sucesso!`));
        }
      } catch (error) {
        return Promise.reject(error);
      }
  }
}
