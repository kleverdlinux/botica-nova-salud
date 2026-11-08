import asyncHandler from 'express-async-handler';
import * as citaService from '../services/citaService.js';

export const registrarCita = asyncHandler(async (req, res) => {
  const { paciente, telefono, servicioId, servicioNombre, precio, horario, notas } = req.body;
  if (!paciente || !telefono) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El nombre del paciente y teléfono son requeridos.'
    });
  }

  const cita = await citaService.registrarCita({
    paciente,
    telefono,
    servicioId,
    servicioNombre,
    precio,
    horario,
    notas
  });

  return res.status(201).json({
    ok: true,
    mensaje: 'Cita de tópico registrada exitosamente.',
    cita
  });
});

export const listarCitas = asyncHandler(async (req, res) => {
  const { estado, busqueda } = req.query;
  const citas = await citaService.listarCitas({ estado, busqueda });

  return res.status(200).json({
    ok: true,
    citas,
    total: citas.length
  });
});

export const cambiarEstadoCita = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nuevoEstado } = req.body;

  const citaActualizada = await citaService.cambiarEstadoCita({
    id,
    nuevoEstado
  });

  return res.status(200).json({
    ok: true,
    mensaje: `Cita ${id} actualizada a ${nuevoEstado}.`,
    cita: citaActualizada
  });
});
