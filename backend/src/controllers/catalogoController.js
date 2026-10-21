import * as catalogoService from '../services/catalogoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const obtenerCatalogo = asyncHandler(async (req, res) => {
  const catalogo = await catalogoService.obtenerCatalogoPublico();
  return res.status(200).json(catalogo);
});
