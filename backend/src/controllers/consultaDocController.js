import { consultarDocumentoIdentidad } from '../services/consultaDocService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const consultarDocumento = asyncHandler(async (req, res) => {
  const { numero } = req.query;

  if (!numero) {
    return res.status(400).json({ error: 'Parámetro "numero" requerido (DNI o RUC).' });
  }

  const resultado = await consultarDocumentoIdentidad(numero);
  return res.status(200).json(resultado);
});

