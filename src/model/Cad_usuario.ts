import { z } from 'zod';
import { campoObrigatorio } from './Cad_agendamento';

export const usuarioSchema = z.object({
  cod_usuario: z.string().optional(), //o cod_usuario pode ser optional pois será gerado automaticamente, não precisando enviar nada no body da requisição
  usuario: z
    .string({ required_error: campoObrigatorio })
    .max(50, { message: 'O usuario deve ter no máximo 50 caracateres' }),
  senha: z.string({ required_error: campoObrigatorio }),
});

export type iUsuarioZod = z.infer<typeof usuarioSchema>;

export interface iUsuario {
  cod_usuario?: string;
  usuario: string;
  senha: string;
}
