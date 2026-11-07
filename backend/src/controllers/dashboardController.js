import * as dashboardService from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const resumen = asyncHandler(async (req, res) => {
  const data = await dashboardService.obtenerResumenDashboard();
  return res.status(200).json(data);
});

export const resumenAlmacen = asyncHandler(async (req, res) => {
  const data = await dashboardService.obtenerResumenAlmacen();
  return res.status(200).json(data);
});

export const resumenCajero = asyncHandler(async (req, res) => {
  const usuarioId = req.usuario?.id;
  const esAdmin = req.usuario?.rol === 'ADMIN';
  const data = await dashboardService.obtenerResumenCajero(usuarioId, esAdmin);
  return res.status(200).json(data);
});
