import { Request, Response } from 'express';
import CadUsuarioDB from '../modelDB/Cad_Usuario_DB';
import criptografar from '../utils/criptografar';
import retornoPadrao from '../utils/retornoPadrao';
import { iUsuario, usuarioSchema } from './../model/Cad_usuario';
import { MySqlConnection } from '../model/MySqlConnection';
import { ErroGeneral } from '../model/ErrorGeneral';

export default class UsuarioController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    //Recebe os dados e faz a validação pelo Zod
    let usuario: iUsuario;
    try {
      usuario = usuarioSchema.parse(req.body);
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        'Objeto recebido não é do tipo esperado',
        error,
      );
      return resp.status(400).json(retornar);
    }

    //Se o usuario for udenfined, gera um Bad Request
    if (typeof usuario === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retor = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o mysql',
        error,
      );
      return resp.status(400).json(retor);
    }

    const cadUsuarioDB = new CadUsuarioDB();

    //Faz a criptografia da senha cadastrada
    try {
      let senhaCrip;
      if (typeof usuario.senha !== 'undefined') {
        if (usuario.senha !== null) {
          senhaCrip = await criptografar.criptografarSenha(usuario.senha);
          usuario.senha = senhaCrip;
        }
      }

      //Se a conexão com oracle for válida e os dados também, passa os dados para a classe DB enviar para o oracle
      //Se houver algum erro, gera um rollback para desfazer qualquer alteração que tenha sido feita
      const retorno = await cadUsuarioDB.insert(usuario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir usuário ${usuario.cod_usuario}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    //Recebe os dados e faz a validação pelo Zod
    let usuario: iUsuario;
    try {
      usuario = usuarioSchema.parse(req.body);
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        'Objeto recebido não é do tipo esperado',
        error,
      );
      return resp.status(400).json(retornar);
    }

    //Se o usuario for udenfined, gera um Bad Request
    if (typeof usuario === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, 'Objeto recebido não é do tipo esperado'));
    }

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retor = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o mysql',
        error,
      );
      return resp.status(400).json(retor);
    }

    const cadUsuarioDB = new CadUsuarioDB();
    try {
      //Faz a criptografia da senha cadastrada
      let senhaCrip;
      if (typeof usuario.senha !== 'undefined') {
        if (usuario.senha !== null) {
          senhaCrip = await criptografar.criptografarSenha(usuario.senha);
          usuario.senha = senhaCrip;
        }
      }

      //Se a conexão com oracle for válida e os dados também, passa os dados para a classe DB enviar para o oracle
      //Se houver algum erro, gera um rollback para desfazer qualquer alteração que tenha sido feita
      const retorno = await cadUsuarioDB.update(usuario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar usuário ${usuario.cod_usuario}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async delete(req: Request, resp: Response): Promise<Response> {
    //Recebe o cod_usuario via url. Se for undefined gera um erro parando a execução
    const { cod_usuario } = req.params;
    if (typeof cod_usuario === 'undefined') {
      return resp
        .status(400)
        .json(retornoPadrao(1, `Objeto recebido não é do tipo esperado`));
    }

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const retor = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o mysql',
        error,
      );
      return resp.status(400).json(retor);
    }

    //Se a conexão com oracle for válida e o cod_agendamento também, passa o valor para a classe DB enviar para o oracle
    //Se houver algum erro, gera um rollback para desfazer qualquer alteração que tenha sido feita
    const cadUsuarioDB = new CadUsuarioDB();
    try {
      const retorno = await cadUsuarioDB.delete(cod_usuario, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao deletar usuário`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }
}
