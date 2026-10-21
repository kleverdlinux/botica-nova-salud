import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { validar } from '../middlewares/validar.js';
import { loginSchema } from '../schemas/authSchemas.js';
import { verificarAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Limitador estricto para evitar ataques de fuerza bruta en el login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,                 // Máximo 10 intentos (el 11avo se bloquea)
  message: { error: 'Demasiados intentos fallidos. Por seguridad, intente de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, validar(loginSchema), authController.login);
router.get('/perfil', verificarAuth, authController.perfil);

export default router;
