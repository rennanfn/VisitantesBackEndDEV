import { Router } from 'express';
import Cad_Agendamento_Controller from '../controller/Cad_Agendamento_Controller';

export const cadAgendamentoRoutes = Router();

cadAgendamentoRoutes.post('/', Cad_Agendamento_Controller.insert);
cadAgendamentoRoutes.put('/', Cad_Agendamento_Controller.update);
cadAgendamentoRoutes.get('/', Cad_Agendamento_Controller.show);
cadAgendamentoRoutes.get('/:cod_agendamento', Cad_Agendamento_Controller.find);
cadAgendamentoRoutes.get('/findData/:data', Cad_Agendamento_Controller.findByData);
cadAgendamentoRoutes.delete(
  '/:cod_agendamento',
  Cad_Agendamento_Controller.delete,
);
