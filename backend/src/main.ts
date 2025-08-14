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
  
  // Configuración de CORS más robusta
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || [];
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      // En desarrollo, permitir todos los origins
      if (isDevelopment) {
        return callback(null, true);
      }
      
      // Permitir requests sin origin (como mobile apps o Postman)
      if (!origin) {
        return callback(null, true);
      }
      
      // Si CORS_ORIGINS está configurado como '*', permitir todo
      if (corsOrigins.includes('*')) {
        return callback(null, true);
      }
      
      // Verificar si el origin está en la lista de permitidos
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.log(`🚫 CORS bloqueado para origin: ${origin}`);
      console.log(`📋 Origins permitidos: ${corsOrigins.join(', ')}`);
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const port = process.env.PORT || 4000;
  console.log('🔧 Configuración del servidor:');
  console.log('   - Entorno:', process.env.NODE_ENV || 'development');
  console.log('   - PORT desde .env:', process.env.PORT);
  console.log('   - Puerto final:', port);
  console.log('   - CORS Origins:', corsOrigins);
  console.log('   - Directorio actual:', process.cwd());
  
  await app.listen(port);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
}
bootstrap();
