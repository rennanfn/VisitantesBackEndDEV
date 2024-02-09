import { z } from 'zod';
import { campoObrigatorio } from './Cad_agendamento';

export const visitanteSchema = z.object({
  cod_visitante: z.string().optional(), //o cod_visitante pode ser optional pois será gerado automaticamente, não precisando enviar nada no body da requisição
  nome: z
    .string({ required_error: campoObrigatorio })
    .min(1, { message: 'O nome do visitante não pode ser nulo' })
    .max(200, {
      message: 'O nome do visitante deve ter no máxima 200 caracteres',
    }),
  rg: z
    .string({ required_error: campoObrigatorio })
    .min(1, { message: 'O RG não pode ser nulo' })
    .max(20, { message: 'O RG deve ter no máximo 12 caracateres' }),
  empresa: z
    .string()
    .max(200, { message: 'A empresa deve ter no máximo 200 caracteres' }),
  foto: z.string().optional(),
  data_criacao: z.date().optional(),
  usuario_criacao: z.string().optional(),
});

export type iVisitanteZod = z.infer<typeof visitanteSchema>;

export interface iVisitante {
  cod_visitante?: string | undefined;
  nome: string;
  rg: string;
  empresa: string;
  foto?: string | undefined;
  data_criacao?: Date | string | undefined;
  usuario_criacao?: string | undefined;
}

export interface CadVisitanteOut extends iVisitante {
  data_criacao: string;
}
