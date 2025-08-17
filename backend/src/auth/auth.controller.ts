import { Controller, Post, Get, Body, UseGuards, Request, UnauthorizedException, Put, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../services/user.service';
import { OperacionService } from '../services/operacion.service';
import { WebCrawlerService } from '../services/web-crawler.service';
import { AIWebAnalyzerService } from '../services/ai-web-analyzer.service';
import { AITimeAnalyzerService } from '../services/ai-time-analyzer.service';
import { UserRole } from '../entities/user.entity';
import { OperacionEstado } from '../entities/operacion.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private operacionService: OperacionService,
    private webCrawlerService: WebCrawlerService,
    private aiWebAnalyzerService: AIWebAnalyzerService,
    private aiTimeAnalyzerService: AITimeAnalyzerService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string; area: string }) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // NO validamos el área, solo la guardamos en la sesión
    return this.authService.login(user, loginDto.area);
  }

  @Post('register')
  async register(@Body() registerDto: {
    nombre: string;
    username: string;
    password: string;
    rol: string;
    area: string;
  }) {
    const userData = {
      ...registerDto,
      rol: registerDto.rol as UserRole
    };
    return this.authService.register(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  validateToken(@Request() req: any) {
    return {
      valid: true,
      user: {
        id: req.user.sub,
        username: req.user.username,
        rol: req.user.rol,
        area: req.user.area
      }
    };
  }

  @Post('analizar-estructura-web')
  async analizarEstructuraWeb(@Body() body: WebAnalysisRequest) {
    try {
      const structureAnalysis = await this.aiWebAnalyzerService.analyzeWebsiteStructure({
        url: body.url,
        rubro: body.rubro,
        servicio: body.servicio,
        tipo: body.tipo
      });

      return {
        success: true,
        data: structureAnalysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error en análisis de estructura web:', error);
      
      return {
        success: false,
        error: 'No se pudo completar el análisis de estructura del sitio web',
        data: await this.aiWebAnalyzerService.analyzeWebsiteStructure({
          url: body.url,
          rubro: body.rubro,
          servicio: body.servicio,
          tipo: body.tipo
        }),
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('generar-descripcion-proyecto')
  async generarDescripcionProyecto(@Body() body: { rubro: string; servicio: string }) {
    try {
      const descripcion = this.crearDescripcionProyecto(body.rubro, body.servicio);
      
      return {
        success: true,
        descripcion: descripcion,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando descripción del proyecto:', error);
      
      return {
        success: false,
        error: 'No se pudo generar la descripción del proyecto',
        descripcion: this.crearDescripcionProyecto(body.rubro, body.servicio),
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('analizar-tiempo-desarrollo')
  async analizarTiempoDesarrollo(@Body() data: { tiempoDesarrollo: string }) {
    try {
      const tiempoAnalizado = await this.aiTimeAnalyzerService.analyzeProjectTime(data.tiempoDesarrollo);
      return { tiempoAnalizado };
    } catch (error) {
      return { tiempoAnalizado: this.aiTimeAnalyzerService.generateFallbackTimeAnalysis(data.tiempoDesarrollo) };
    }
  }

  @Post('mejorar-requerimientos')
  async mejorarRequerimientos(@Body() data: { requerimientos: string; rubro: string; servicio: string }) {
    try {
      const requerimientosMejorados = await this.aiTimeAnalyzerService.mejorarRequerimientosTecnicos(data.requerimientos, data.rubro, data.servicio);
      return { requerimientosMejorados };
    } catch (error) {
      // @ts-ignore
      return { requerimientosMejorados: this.aiTimeAnalyzerService.generateFallbackRequerimientosMejorados(data.requerimientos) };
    }
  }

  // Nuevos endpoints para gestión de operaciones (solo admin)
  @UseGuards(JwtAuthGuard)
  @Get('operaciones')
  async getOperaciones(
    @Request() req: any,
    @Query('pagina') pagina: string = '1',
    @Query('porPagina') porPagina: string = '9',
    @Query('area') area: string = 'todas'
  ) {
    const userId = req.user.sub;
    const paginaNum = parseInt(pagina, 10);
    const porPaginaNum = parseInt(porPagina, 10);
    
    return this.operacionService.getOperacionesConPaginacion(
      userId, 
      paginaNum, 
      porPaginaNum, 
      area
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('areas')
  async getAreas(@Request() req: any) {
    // Retornar áreas por defecto para que funcione el filtro
    return ['Comercial', 'Marketing', 'TI', 'Administración', 'Medios'];
  }

  @UseGuards(JwtAuthGuard)
  @Post('operaciones')
  async createOperacion(@Request() req: any, @Body() operacionData: { nombre: string; fecha: Date; estado: string; area: string }) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado');
    }
    return await this.operacionService.createOperacion({
      ...operacionData,
      estado: operacionData.estado as OperacionEstado,
      userId: req.user.sub,
      area: operacionData.area || req.user.area
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('guardar-cotizacion')
  async guardarCotizacion(@Request() req: any, @Body() cotizacionData: { nombre: string; data: any }) {
    return await this.operacionService.createCotizacion({
      nombre: cotizacionData.nombre,
      userId: req.user.sub,
      area: req.user.area,
      data: cotizacionData.data
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('operaciones/:id')
  async getOperacion(@Request() req: any, @Body() data: { id: number }) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado');
    }
    return await this.operacionService.getOperacionById(data.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('operaciones/:id')
  async updateOperacion(@Request() req: any, @Body() data: { id: number; operacionData: any }) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado');
    }
    return await this.operacionService.updateOperacion(data.id, data.operacionData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('operaciones/:id')
  async deleteOperacion(@Request() req: any, @Body() data: { id: number }) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado');
    }
    return await this.operacionService.deleteOperacion(data.id);
  }

  private crearDescripcionProyecto(rubro: string, servicio: string): string {
    const descripciones: Record<string, Record<string, string>> = {
      'Inmobiliario': {
        'Landing': `En un mercado inmobiliario en constante evolución, la presencia en línea se ha convertido en un elemento indispensable para el éxito y la competitividad de las empresas del sector. En este contexto, la renovación de su página web no solo es una necesidad, sino una oportunidad estratégica para destacarse y posicionarse de manera efectiva en el mercado.

Una página web renovada con técnicas avanzadas de diseño y desarrollo no solo es una plataforma para mostrar propiedades, sino una herramienta poderosa para atraer y cautivar a clientes potenciales. Este proyecto de landing page inmobiliaria incluirá una galería de propiedades destacadas, filtros de búsqueda personalizados, formularios de contacto optimizados y un diseño responsive que garantice una experiencia excepcional en todos los dispositivos.`,
        
        'E-Commerce': `En el competitivo sector inmobiliario, la digitalización de los procesos comerciales se ha convertido en una ventaja competitiva fundamental. Este proyecto de plataforma de comercio electrónico inmobiliario representa una oportunidad única para transformar la manera en que los clientes exploran, comparan y adquieren propiedades.

La implementación de un e-commerce especializado en el sector inmobiliario permitirá a los clientes navegar por un catálogo completo de propiedades con filtros avanzados, realizar tours virtuales, comparar opciones lado a lado y completar el proceso de reserva de manera segura y eficiente. La plataforma incluirá un sistema de pagos integrado, panel de usuario personalizado y herramientas de comunicación directa con asesores.`,
        
        'Aplicación': `En la era de la movilidad, el acceso a información inmobiliaria desde dispositivos móviles se ha convertido en una necesidad fundamental para los clientes del sector. Este proyecto de aplicación móvil inmobiliaria representa la evolución natural de la experiencia de usuario, llevando la funcionalidad de una plataforma web completa al bolsillo de cada cliente potencial.

La aplicación incluirá búsqueda geolocalizada de propiedades, notificaciones push sobre nuevas ofertas, tours virtuales en realidad aumentada, sistema de mensajería integrado con asesores y sincronización offline para acceso sin conexión. Esta herramienta móvil se convertirá en el punto de contacto principal entre la empresa y sus clientes, facilitando la toma de decisiones y mejorando significativamente la tasa de conversión.`
      },
      'Retail': {
        'E-Commerce': `En el dinámico mundo del retail, la transformación digital se ha convertido en el motor principal del crecimiento y la competitividad. Este proyecto de plataforma de comercio electrónico para retail representa una oportunidad estratégica para expandir el alcance del negocio y crear una experiencia de compra excepcional que supere las expectativas de los clientes.

La implementación de un e-commerce moderno incluirá un catálogo de productos con navegación intuitiva, sistema de carrito de compras optimizado, múltiples opciones de pago seguras, programa de lealtad integrado y sistema de reviews y ratings. La plataforma estará diseñada para maximizar la conversión de visitantes en compradores, ofreciendo una experiencia de usuario fluida y atractiva que refleje la calidad y profesionalismo de la marca.`,
        
        'Landing': `En el competitivo sector retail, la primera impresión digital puede marcar la diferencia entre un cliente potencial y un cliente perdido. Este proyecto de landing page para retail está diseñado para capturar la atención de los visitantes desde el primer momento y convertirlos en clientes comprometidos.

La landing page incluirá un diseño visual impactante que muestre los productos más destacados, sección de ofertas especiales, testimonios de clientes satisfechos, newsletter para captación de leads y formularios de contacto optimizados. El objetivo es crear una experiencia memorable que impulse la acción del usuario y genere conversiones significativas para el negocio.`,
        
        'Aplicación': `En la era del comercio móvil, tener una aplicación de retail se ha convertido en una ventaja competitiva esencial. Este proyecto de aplicación móvil para retail permitirá a los clientes acceder al catálogo completo de productos, realizar compras de manera intuitiva y recibir notificaciones personalizadas sobre ofertas y novedades.

La aplicación incluirá navegación por categorías, búsqueda avanzada de productos, sistema de wishlist, historial de compras, programa de puntos y recompensas, y notificaciones push estratégicas. Esta herramienta móvil se convertirá en el canal principal de interacción con los clientes, aumentando la frecuencia de compra y fortaleciendo la lealtad hacia la marca.`
      },
      'Financiero': {
        'Landing': `En el sector financiero, la confianza y la credibilidad son los pilares fundamentales de cualquier relación comercial. Este proyecto de landing page financiera está diseñado para transmitir estos valores esenciales mientras presenta los servicios de manera clara y profesional, estableciendo una base sólida para la confianza del cliente.

La landing page incluirá calculadoras financieras interactivas, simuladores de crédito, testimonios de clientes satisfechos, información sobre certificaciones de seguridad, centro de ayuda con FAQ y chat especializado para consultas. El diseño reflejará la seriedad y profesionalismo del sector financiero, mientras mantiene la accesibilidad y facilidad de uso que los clientes modernos esperan.`,
        
        'Aplicación': `En el mundo financiero digital, la seguridad y la accesibilidad son igualmente importantes. Este proyecto de aplicación financiera móvil representa la evolución de los servicios bancarios tradicionales, ofreciendo a los usuarios la capacidad de gestionar sus finanzas de manera segura y conveniente desde cualquier lugar.

La aplicación incluirá autenticación de dos factores, dashboard personalizado con resumen de productos, historial completo de transacciones, alertas y notificaciones personalizadas, generación de reportes financieros y soporte para múltiples monedas. La seguridad será la prioridad absoluta, implementando las mejores prácticas de encriptación y protección de datos para garantizar la confianza total de los usuarios.`,
        
        'Web Multiproyecto': `En el sector financiero, la complejidad de los servicios requiere una presencia digital integral que pueda manejar múltiples productos y funcionalidades bajo una marca cohesiva. Este proyecto de ecosistema web financiero representa una solución completa que integra todos los servicios de la institución en una plataforma unificada y profesional.

El ecosistema web incluirá múltiples módulos especializados: portal de clientes, calculadoras financieras avanzadas, simuladores de diferentes tipos de crédito, centro de ayuda integral, sistema de tickets de soporte, blog con contenido financiero educativo y integración con sistemas internos. La arquitectura será escalable y modular, permitiendo el crecimiento futuro y la adición de nuevos servicios sin afectar la experiencia del usuario.`
      }
    };

    return descripciones[rubro]?.[servicio] || `En el sector ${rubro.toLowerCase()}, la implementación de ${servicio.toLowerCase()} representa una oportunidad estratégica para mejorar la presencia digital y optimizar la experiencia del cliente. Este proyecto consistirá en el desarrollo de una plataforma moderna que cumpla con los estándares más altos de funcionalidad, diseño y seguridad, adaptándose a las demandas específicas del mercado y las expectativas de los usuarios modernos.`;
  }
} 