import { z } from 'zod';

export const campoObrigatorio = 'obrigatório';

export const agendamentoSchema = z.object({
  cod_agendamento: z.string().optional(), //o cod_agendamento pode ser optional pois será gerado automaticamente, não precisando enviar nada no body da requisição
  visitante: z
    .string({ required_error: campoObrigatorio })
    .min(1, { message: 'O nome do visitante não pode ser nulo' })
    .max(100, {
      message: 'O nome do visitante deve ter no máximo 100 caracteres',
    }),
  data: z.string({ required_error: campoObrigatorio }),
  hora_agendada: z.string({ required_error: campoObrigatorio }),
  hora_entrada: z.string().optional(),
  hora_saida: z.string().optional(),
  observacao: z
    .string()
    .max(500, { message: 'A observação deve ter no máximo 500 caracateres' })
    .optional(),
  status: z
    .string({ required_error: campoObrigatorio })
    .max(15, { message: 'O status deve ter no máximo 15 caracateres' }),
  data_criacao: z.date().optional(), //data gerada atuomaticamente
  usuario_criacao: z.string({ required_error: campoObrigatorio }).optional(), //identifica o cod_usuario pelo token do usuario logado no momento que cria o agendamento
});

export type iAgendamentoZod = z.infer<typeof agendamentoSchema>;

export interface iAgendamento {
  cod_agendamento?: string | undefined;
  visitante: string;
  data: Date | string;
  hora_agendada: string;
  hora_entrada?: string;
  hora_saida?: string;
  observacao?: string | undefined;
  status: string;
  data_criacao?: Date | string | undefined;
  usuario_criacao?: string;
}
export interface cadAgendamentoOut extends iAgendamento {
  data: string;
  data_criacao: string;
}
