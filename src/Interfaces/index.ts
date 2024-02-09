export type ErroType = 0 | 1;

export interface ReturnDefaultInt {
  retorno: {
    erro: ErroType;
    mensagem: string;
  };
}

export abstract class ReturnDefault implements ReturnDefaultInt {
  retorno!: { erro: ErroType; mensagem: string };
}

export interface ObjetoAcoes {
  objeto: string;
  acoes: string[];
}

export interface Token {
  cod_usuario: string;
  usuario: string;
}
