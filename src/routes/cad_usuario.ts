import { Router } from 'express';
import Cad_Usuario_Controller from '../controller/Cad_Usuario_Controller';

export const cadUsuarioRoutes = Router();

cadUsuarioRoutes.post('/', Cad_Usuario_Controller.insert);
cadUsuarioRoutes.put('/', Cad_Usuario_Controller.update);
cadUsuarioRoutes.delete('/:cod_usuario', Cad_Usuario_Controller.delete);
