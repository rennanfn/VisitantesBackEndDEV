import { Router } from 'express';
import Cad_Visitante_Controller from '../controller/Cad_Visitante_Controller';

export const cadVisitanteRoutes = Router();

cadVisitanteRoutes.post('/', Cad_Visitante_Controller.insert);
cadVisitanteRoutes.put('/', Cad_Visitante_Controller.update);
cadVisitanteRoutes.get('/', Cad_Visitante_Controller.show);
cadVisitanteRoutes.get('/:cod_visitante', Cad_Visitante_Controller.find);
