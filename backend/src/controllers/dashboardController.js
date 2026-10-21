import * as dashboardService from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const resumen = asyncHandler(async (req, res) => {
  const data = await dashboardService.obtenerResumenDashboard();
  return res.status(200).json(data);
});
