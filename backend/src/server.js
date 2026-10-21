import 'dotenv/config';
import app from './app.js';

// Verificación obligatoria de seguridad al arranque
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 32) {
  console.error('FATAL: JWT_SECRET no está configurado o tiene menos de 32 caracteres.');
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🏥 Servidor Botica Nova Salud iniciado`);
  console.log(`🚀 Puerto: ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});
