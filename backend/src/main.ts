/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { config } from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde el directorio raíz del proyecto
config({ path: path.resolve(process.cwd(), '../.env') });

// También intentar cargar desde el directorio actual
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  console.log('🔧 Configuración del puerto:');
  console.log('   - PORT desde .env:', process.env.PORT);
  console.log('   - Puerto final:', port);
  console.log('   - Directorio actual:', process.cwd());
  
  await app.listen(port);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
}
bootstrap();
