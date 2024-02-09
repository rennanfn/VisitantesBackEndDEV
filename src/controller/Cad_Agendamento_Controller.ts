import { Request, Response } from 'express';
import CadAgendamentoDB from '../modelDB/Cad_Agendamento_DB';
import retornoPadrao from '../utils/retornoPadrao';
import { agendamentoSchema, iAgendamento } from './../model/Cad_agendamento';
import { MySqlConnection } from '../model/MySqlConnection';
import { ErroGeneral } from '../model/ErrorGeneral';

export default class AgendamentoController {
  static async insert(req: Request, resp: Response): Promise<Response> {
    //Recebe os dados e faz a validação pelo Zod
    let agendamento: iAgendamento;
    try {
      agendamento = agendamentoSchema.parse(req.body);
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        'Objeto recebido não é do tipo esperado',
        error,
      );
      return resp.status(400).json(retornar);
    }

    agendamento.data_criacao = new Date();

    //Se o agendamento for udenfined, gera um Bad Request
    if (typeof agendamento === 'undefined') {
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

    //Se a conexão com oracle for válida e os dados também, passa os dados para a classe DB enviar para o oracle
    //Se houver algum erro, gera um rollback para desfazer qualquer alteração que tenha sido feita
    const cadAgendamentoDB = new CadAgendamentoDB();
    try {
      const retorno = await cadAgendamentoDB.insert(agendamento, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao inserir agendamento ${agendamento.cod_agendamento}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async update(req: Request, resp: Response): Promise<Response> {
    //Recebe os dados e faz a validação pelo Zod
    let agendamento: iAgendamento;
    try {
      agendamento = agendamentoSchema.parse(req.body);
    } catch (error) {
      const retornar = ErroGeneral.getErrorGeneral(
        'Objeto recebido não é do tipo esperado',
        error,
      );
      return resp.status(400).json(retornar);
    }

    //Se o agendamento for udenfined, gera um Bad Request
    if (typeof agendamento === 'undefined') {
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

    //Se a conexão com oracle for válida e os dados também, passa os dados para a classe DB enviar para o oracle
    //Se houver algum erro, gera um rollback para desfazer qualquer alteração que tenha sido feita
    const cadAgendamentoDB = new CadAgendamentoDB();
    try {
      const retorno = await cadAgendamentoDB.update(agendamento, connection);
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao atualizar agendamento ${agendamento.cod_agendamento}`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async show(req: Request, resp: Response): Promise<Response> {
    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const erroG = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o mysql',
        error,
      );
      return resp.status(400).json(erroG);
    }

    //Neste caso não é passado nenhum parametro, apenas a conexão criada para o oracle retornar os dados cadastrados na tabela
    const CadAgendamento = new CadAgendamentoDB();
    try {
      const retorno = await CadAgendamento.show(connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async find(req: Request, resp: Response): Promise<Response> {
    //Para este caso, passa o cod_agendamento como parametro para fazer uma busca especifica
    const { cod_agendamento } = req.params;

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const erroG = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o mysql',
        error,
      );
      return resp.status(400).json(erroG);
    }

    //Se a conexão com oracle for válida e o cod_agendamento também, passa o valor para a classe DB enviar para o oracle
    const CadAgendamento = new CadAgendamentoDB();
    try {
      const retorno = await CadAgendamento.find(cod_agendamento, connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async findByData(req: Request, resp: Response): Promise<Response> {
    //Para este caso, passa o cod_agendamento como parametro para fazer uma busca especifica
    const { data } = req.params;

    //Cria uma conexão válida com o oracle
    let connection;
    try {
      connection = await MySqlConnection.getConnection();
    } catch (error) {
      const erroG = ErroGeneral.getErrorGeneral(
        'Erro ao abrir conexão com o mysql',
        error,
      );
      return resp.status(400).json(erroG);
    }

    //Se a conexão com oracle for válida e o cod_agendamento também, passa o valor para a classe DB enviar para o oracle
    const CadAgendamento = new CadAgendamentoDB();
    try {
      const retorno = await CadAgendamento.findByData(data, connection);
      return resp.json(retorno);
    } catch (error) {
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao buscar parâmetros`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }

  static async delete(req: Request, resp: Response): Promise<Response> {
    //Recebe o cod_agendamento via url. Se for undefined gera um erro parando a execução
    const { cod_agendamento } = req.params;
    if (typeof cod_agendamento === 'undefined') {
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
    const cadAgendamentoDB = new CadAgendamentoDB();
    try {
      const retorno = await cadAgendamentoDB.delete(
        cod_agendamento,
        connection,
      );
      await connection.commit();
      return resp.json(retorno);
    } catch (error) {
      await connection.rollback();
      const resultErro = ErroGeneral.getErrorGeneral(
        `Erro ao deletar agendamento`,
        error,
      );
      return resp.status(400).json(resultErro);
    } finally {
      MySqlConnection.closeConnection(connection);
    }
  }
}
