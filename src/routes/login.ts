import { Router } from 'express';

import { Login } from '../controller/Login';

export const loginRoutes = Router();

loginRoutes.post('/', Login.autenticar);
loginRoutes.get('/refreshToken', Login.refreshToken);
