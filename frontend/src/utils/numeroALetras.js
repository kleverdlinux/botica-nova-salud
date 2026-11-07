// Conversor de montos numéricos a texto en español (Estándar SUNAT / Perú)
// Ejemplo: 84.90 -> "SON: OCHENTA Y CUATRO CON 90/100 SOLES"

const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const DECENAS = [
  '',
  'DIEZ',
  'VEINTE',
  'TREINTA',
  'CUARENTA',
  'CINCUENTA',
  'SESENTA',
  'SETENTA',
  'OCHENTA',
  'NOVENTA'
];
const ESPECIALES = {
  11: 'ONCE',
  12: 'DOCE',
  13: 'TRECE',
  14: 'CATORCE',
  15: 'QUINCE',
  16: 'DIECISÉIS',
  17: 'DIECISIETE',
  18: 'DIECIOCHO',
  19: 'DIECINUEVE',
  21: 'VEINTIÚN',
  22: 'VEINTIDÓS',
  23: 'VEINTITRÉS',
  24: 'VEINTICUATRO',
  25: 'VEINTICINCO',
  26: 'VEINTISÉIS',
  27: 'VEINTISIETE',
  28: 'VEINTIOCHO',
  29: 'VEINTINUEVE'
};
const CENTENAS = [
  '',
  'CIENTO',
  'DOSCIENTOS',
  'TRESCIENTOS',
  'CUATROCIENTOS',
  'QUINIENTOS',
  'SEISCIENTOS',
  'SETECIENTOS',
  'OCHOCIENTOS',
  'NOVECIENTOS'
];

function convertirCentenas(n) {
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  let dec = '';

  if (resto in ESPECIALES) {
    dec = ESPECIALES[resto];
  } else {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    if (d > 0 && u > 0) {
      dec = `${DECENAS[d]} Y ${UNIDADES[u]}`;
    } else if (d > 0) {
      dec = DECENAS[d];
    } else if (u > 0) {
      dec = UNIDADES[u];
    }
  }

  if (c > 0 && dec) {
    return `${CENTENAS[c]} ${dec}`;
  } else if (c > 0) {
    return CENTENAS[c];
  }
  return dec;
}

export function montoALetras(monto, moneda = 'SOLES') {
  const num = Math.abs(Number(monto) || 0);
  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);
  const centavosStr = String(centavos).padStart(2, '0');

  if (entero === 0) {
    return `CERO CON ${centavosStr}/100 ${moneda}`;
  }

  let letras = '';
  const miles = Math.floor(entero / 1000);
  const restoMiles = entero % 1000;

  if (miles === 1) {
    letras = 'MIL';
  } else if (miles > 1) {
    letras = `${convertirCentenas(miles)} MIL`;
  }

  if (restoMiles > 0) {
    const restoLetras = convertirCentenas(restoMiles);
    letras = letras ? `${letras} ${restoLetras}` : restoLetras;
  }

  return `SON: ${letras.trim()} CON ${centavosStr}/100 ${moneda}`;
}

