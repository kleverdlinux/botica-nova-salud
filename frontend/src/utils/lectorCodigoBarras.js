import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType
} from '@zxing/library';

// Formatos farmacéuticos compatibles con boticas y medicamentos
const formatosSoportados = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.QR_CODE,
  BarcodeFormat.ITF
];

const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, formatosSoportados);
hints.set(DecodeHintType.TRY_HARDER, true);

const codeReader = new BrowserMultiFormatReader(hints);

/**
 * Genera un canvas recortado a un encuadre específico y opcionalmente rotado 90°
 */
function recortarYRotarCanvas(img, sxPct, syPct, swPct, shPct, rotar90 = false, aplicarFiltro = false) {
  const sx = Math.max(0, Math.round(img.width * sxPct));
  const sy = Math.max(0, Math.round(img.height * syPct));
  const sw = Math.min(img.width - sx, Math.round(img.width * swPct));
  const sh = Math.min(img.height - sy, Math.round(img.height * shPct));

  // Redimensionar si el recorte supera 1200px para que las barras tengan el grosor óptimo
  let destW = sw;
  let destH = sh;
  const maxDim = 1200;
  if (destW > maxDim || destH > maxDim) {
    if (destW > destH) {
      destH = Math.round((destH * maxDim) / destW);
      destW = maxDim;
    } else {
      destW = Math.round((destW * maxDim) / destH);
      destH = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  if (rotar90) {
    canvas.width = destH;
    canvas.height = destW;
  } else {
    canvas.width = destW;
    canvas.height = destH;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (aplicarFiltro) {
    // Realzar contraste para cajas con brillo o reflejos
    ctx.filter = 'grayscale(100%) contrast(160%)';
  }

  if (rotar90) {
    ctx.translate(destH / 2, destW / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, sx, sy, sw, sh, -destW / 2, -destH / 2, destW, destH);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
  }

  return canvas;
}

/**
 * Decodifica un código de barras enfocándose prioritariamente en el ENCUADRE del código
 * y probando orientaciones horizontal y vertical (90°)
 */
export async function decodificarCodigoDeBarrasDesdeArchivo(file) {
  if (!file) throw new Error('No se seleccionó ninguna imagen.');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = async () => {
        // Lista de encuadres a probar ordenados de mayor a menor probabilidad:
        // 1. Encuadre central horizontal (donde la persona enfoca el código de barras)
        // 2. Encuadre rotado 90° (por si el código está vertical en la caja)
        // 3. Encuadre central con alto contraste
        // 4. Encuadre amplio
        // 5. Imagen completa
        const configuracionesEncuadre = [
          // 1. Encuadre central estándar (Horizontal)
          { sx: 0.1, sy: 0.25, sw: 0.8, sh: 0.5, rotar: false, filtro: false },
          // 2. Encuadre central rotado 90° (Vertical)
          { sx: 0.1, sy: 0.25, sw: 0.8, sh: 0.5, rotar: true, filtro: false },
          // 3. Encuadre central con realce de contraste
          { sx: 0.1, sy: 0.25, sw: 0.8, sh: 0.5, rotar: false, filtro: true },
          // 4. Encuadre central rotado con contraste
          { sx: 0.1, sy: 0.25, sw: 0.8, sh: 0.5, rotar: true, filtro: true },
          // 5. Encuadre ajustado al centro exacto (cercano)
          { sx: 0.2, sy: 0.3, sw: 0.6, sh: 0.4, rotar: false, filtro: false },
          // 6. Imagen completa escalada (Horizontal)
          { sx: 0.0, sy: 0.0, sw: 1.0, sh: 1.0, rotar: false, filtro: false },
          // 7. Imagen completa rotada 90° (Vertical)
          { sx: 0.0, sy: 0.0, sw: 1.0, sh: 1.0, rotar: true, filtro: false }
        ];

        for (const config of configuracionesEncuadre) {
          try {
            const canvas = recortarYRotarCanvas(
              img,
              config.sx,
              config.sy,
              config.sw,
              config.sh,
              config.rotar,
              config.filtro
            );

            const resultado = await codeReader.decodeFromCanvas(canvas);
            if (resultado && resultado.getText()) {
              const codigoLimpio = resultado.getText().trim();
              if (codigoLimpio) {
                return resolve(codigoLimpio);
              }
            }
          } catch (err) {
            // Continuar con el siguiente encuadre
          }
        }

        // Último intento: BarcodeDetector nativo si existe
        if ('BarcodeDetector' in window) {
          try {
            const detector = new window.BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a']
            });
            const barcodes = await detector.detect(img);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              return resolve(barcodes[0].rawValue.trim());
            }
          } catch (errNative) {}
        }

        reject(new Error('No se reconoció el código de barras en el encuadre. Acerque la cámara para que el código de barras ocupe el centro de la foto.'));
      };

      img.onerror = () => reject(new Error('No se pudo cargar la imagen tomada.'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo en el teléfono.'));
    reader.readAsDataURL(file);
  });
}
