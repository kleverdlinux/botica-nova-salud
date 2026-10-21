import * as alertaService from '../services/alertaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const obtenerAlertas = asyncHandler(async (req, res) => {
  const alertas = await alertaService.obtenerAlertas();
  return res.status(200).json(alertas);
});
