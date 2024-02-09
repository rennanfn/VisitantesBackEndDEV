import { Connection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import ShortUniqueId from 'short-unique-id';
import { ReturnDefault } from '../Interfaces';
import { iUsuario } from '../model/Cad_usuario';
import { consoleLog, pVerbose } from '../utils/consoleLog';
import retornoPadrao from '../utils/retornoPadrao';

export default class CadUsuarioDB {
  private rowsUndefined(): Error {
    // Quando rows for undefined é porque teve algum erro na bibliteca mysql
    // quando não encontra dados na tabela retorna um array vazio, e se o select falhar
    // por algum campo escrito errado, cai no catch, então somente retorna undefined em rows em caso de erro no mysql
    consoleLog(`Erro ao buscar usuário, rows = undefined`, pVerbose.erro);
    return new Error(`Erro ao buscar usuário, rows = undefined`);
  }

  async insert(
    obj: iUsuario,
    conn: Connection,
  ): Promise<ReturnDefault> {
    const { randomUUID } = new ShortUniqueId({
      dictionary: 'hex',
      length: 10,
    });
    obj.cod_usuario = randomUUID();
    const sql = `INSERT INTO visitantes_usuario (cod_usuario, usuario, senha)
                 VALUES (?,?,?)`;
    const values = [
      obj.cod_usuario,
      obj.usuario,
      obj.senha
    ];

      try {
        const result = await conn.query<ResultSetHeader>(sql, values);
        if (result) {
          consoleLog(
            `Usuário inserido com sucesso!`,
            pVerbose.aviso,
          );
          return Promise.resolve(
            retornoPadrao(0, `Usuário inserido com sucesso!`),
          );
        } else {
          consoleLog(`Erro ao inserir usuário`, pVerbose.erro);
          return Promise.resolve(retornoPadrao(1, `Erro ao inserir usuário`));
        }
      } catch (error) {
        consoleLog(`Erro ao inserir usuário: ${error}`, pVerbose.erro);
        return Promise.reject(error);
      }
  }

  async update(
    obj: iUsuario,
    conn: Connection,
  ): Promise<ReturnDefault> {
    const sql = `UPDATE visitantes_usuario SET cod_usuario = ?, usuario = ?, senha = ?`;
    const values = [
      obj.cod_usuario,
      obj.usuario,
      obj.senha
    ];
    try {
      const result = await conn.query<ResultSetHeader>(sql, values);
      if (!result) {
        consoleLog(`Usuário não encontrado!`, pVerbose.erro);
        return Promise.reject(retornoPadrao(1, `Usuário não encontrado!`));
      }
        consoleLog(
          `Usuário atualizado com sucesso!`,
          pVerbose.aviso,
        );
        return Promise.resolve(
          retornoPadrao(
            0,
            `Usuário atualizado com sucesso!`,
          ),
        );
    } catch (error) {
      consoleLog(`Erro ao atualizar usuário: ${error}`, pVerbose.erro);
      return Promise.reject(error);
    }
  }

  async show(conn: Connection): Promise<iUsuario[]> {
      const sql = `SELECT * FROM visitantes_usuario ORDER BY usuario asc`;
    try{
      const [rows] = await conn.query<RowDataPacket[]>(sql);
      if(!Array.isArray(rows)){
        return Promise.reject(this.rowsUndefined());
      }
      const usuario = rows.map((formatObject: RowDataPacket) => {
        return {
          ...formatObject,
        } as iUsuario;
      });
      return Promise.resolve(usuario);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async find(
    user: string,
    conn: Connection
  ): Promise<iUsuario[]> {
    const sql = `SELECT * FROM visitantes_usuario
                WHERE usuario = ?`;
    try {
      const [rows] = await conn.query<RowDataPacket[]>(sql, [user]);

      if(!Array.isArray(rows)){
        return Promise.reject(this.rowsUndefined());
      }
      const usuario = rows.map((formatObject: RowDataPacket) => {
        return {
          ...formatObject,
        } as iUsuario;
      });
      return Promise.resolve(usuario);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async delete(
    cod_usuario: string,
    conn: Connection,
  ): Promise<ReturnDefault> {
      const sql =
        'DELETE FROM visitantes_usuario WHERE cod_usuario = ?';

      try {
        const rows = await conn.query(sql, [cod_usuario]);

        if (!rows) {
          consoleLog(
            `Erro ao deletar usuário`,
            pVerbose.erro,
          );
          return Promise.reject(
            retornoPadrao(1, `Erro ao deletar usuário`),
          );

        } else {
          consoleLog(`Usuário deletado com sucesso!`, pVerbose.aviso);
          return Promise.resolve(retornoPadrao(0, `Usuário deletado com sucesso!`));
        }
      } catch (error) {
        return Promise.reject(error);
      }
  }
}
