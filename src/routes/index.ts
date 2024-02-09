import { validaToken } from './../utils/token';
import { cadAgendamentoRoutes } from './cad_agendamento';
import { loginRoutes } from './login';
import { Router } from 'express';
import { cadUsuarioRoutes } from './cad_usuario';
import { cadVisitanteRoutes } from './cad_visitante';
import { HoneyPot } from '../utils/HoneyPot';

export const routes = Router();

routes.use('/login', loginRoutes);
routes.use('/cadUsuario', validaToken, cadUsuarioRoutes);
routes.use('/cadAgendamento', validaToken, cadAgendamentoRoutes);
routes.use('/cadVisitante', validaToken, cadVisitanteRoutes);

routes.all('/*', HoneyPot.reqGet);
