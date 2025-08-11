import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Operacion, OperacionEstado } from '../entities/operacion.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InitService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Operacion)
    private operacionRepository: Repository<Operacion>,
  ) {}

  async onModuleInit() {
    console.log('🔄 Inicializando base de datos...');
    
    try {
      await this.initializeDefaultUsers();
      await this.initializeSampleOperaciones();
      console.log('✅ Base de datos inicializada exitosamente');
    } catch (error) {
      console.error('❌ Error al inicializar la base de datos:', error);
    }
  }

  private async initializeDefaultUsers(): Promise<void> {
    const existingAdmin = await this.userRepository.findOne({ 
      where: { username: 'admin' } 
    });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('12345', 10);
      const adminUser = this.userRepository.create({
        nombre: 'Administrador',
        username: 'admin',
        password: hashedPassword,
        rol: UserRole.ADMIN,
        area: 'Administración'
      });
      await this.userRepository.save(adminUser);
      console.log('✅ Usuario admin creado');
    }

    const existingCotizador = await this.userRepository.findOne({ 
      where: { username: 'cotizador' } 
    });
    
    if (!existingCotizador) {
      const hashedPassword = await bcrypt.hash('12345', 10);
      const cotizadorUser = this.userRepository.create({
        nombre: 'Cotizador',
        username: 'cotizador',
        password: hashedPassword,
        rol: UserRole.COTIZADOR,
        area: 'Comercial'
      });
      await this.userRepository.save(cotizadorUser);
      console.log('✅ Usuario cotizador creado');
    }
  }

  private async initializeSampleOperaciones(): Promise<void> {
    const existingOperaciones = await this.operacionRepository.count();
    
    if (existingOperaciones === 0) {
      const adminUser = await this.userRepository.findOne({ 
        where: { username: 'admin' } 
      });
      
      if (adminUser) {
        const operaciones = [
          {
            nombre: 'Cotización para Empresa ABC',
            fecha: new Date(),
            estado: OperacionEstado.COMPLETADA,
            userId: adminUser.id,
            area: 'Comercial',
            data: { empresa: 'Empresa ABC', proyecto: 'Sitio web corporativo' }
          },
          {
            nombre: 'Análisis de sitio web XYZ',
            fecha: new Date(Date.now() - 86400000), // Ayer
            estado: OperacionEstado.EN_PROCESO,
            userId: adminUser.id,
            area: 'Marketing',
            data: { empresa: 'Empresa XYZ', proyecto: 'Análisis SEO' }
          },
          {
            nombre: 'Propuesta comercial para Startup',
            fecha: new Date(Date.now() - 172800000), // Hace 2 días
            estado: OperacionEstado.PENDIENTE,
            userId: adminUser.id,
            area: 'Comercial',
            data: { empresa: 'Startup', proyecto: 'Aplicación móvil' }
          }
        ];

        for (const operacionData of operaciones) {
          const operacion = this.operacionRepository.create(operacionData);
          await this.operacionRepository.save(operacion);
        }
        console.log('✅ Operaciones de ejemplo creadas');
      }
    }
  }
} 