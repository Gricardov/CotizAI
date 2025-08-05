import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface SectionAnalysis {
  name: string;
  description: string;
  found: boolean;
  content_summary?: string;
  recommendations?: string[];
}

interface WebsiteStructure {
  url: string;
  title: string;
  existing_sections: SectionAnalysis[];
  missing_sections: SectionAnalysis[];
  recommended_sections: SectionAnalysis[];
  overall_analysis: string;
  score: number;
}

interface AIAnalysisRequest {
  url: string;
  rubro: string;
  servicio: string;
  tipo: string;
}

@Injectable()
export class AIWebAnalyzerService {
  private readonly SECTOR_SECTIONS: Record<string, Record<string, Array<{name: string, description: string, required: boolean}>>> = {
    'Inmobiliario': {
      'Landing': [
        {
          name: 'Inicio (Home)',
          description: 'Página principal con cabecera, slider de imágenes, proyectos destacados, filtro de búsqueda y formulario de cotización',
          required: true
        },
        {
          name: 'Nosotros',
          description: 'Historia de la empresa, valores, filosofía, línea de tiempo de proyectos y formulario de cotización',
          required: true
        },
        {
          name: 'Proyectos',
          description: 'Galería de proyectos con filtros avanzados, páginas individuales con detalles específicos',
          required: true
        },
        {
          name: 'Detalle del Proyecto',
          description: 'Slider del proyecto, presentación, detalles iconográficos, avances de obra, concepto, galerías, recorrido virtual, mapa y formulario de cotización',
          required: true
        },
        {
          name: 'Vende tu Terreno',
          description: 'Programa de referidos con premios, beneficios, pasos a seguir y formulario de datos',
          required: false
        },
        {
          name: 'Refiere y Gana',
          description: 'Blog o noticias sobre novedades, eventos y noticias del sector inmobiliario',
          required: false
        },
        {
          name: 'Contacto',
          description: 'Formulario de cotización, información de contacto y ubicación',
          required: true
        }
      ],
      'E-Commerce': [
        {
          name: 'Catálogo de Propiedades',
          description: 'Lista completa de propiedades con filtros avanzados, búsqueda y comparación',
          required: true
        },
        {
          name: 'Sistema de Reservas',
          description: 'Proceso de reserva online con pasarela de pagos y confirmación',
          required: true
        },
        {
          name: 'Panel de Usuario',
          description: 'Dashboard personalizado para gestionar reservas, favoritos y preferencias',
          required: true
        },
        {
          name: 'Comparador de Propiedades',
          description: 'Herramienta para comparar múltiples propiedades lado a lado',
          required: true
        },
        {
          name: 'Chat en Vivo',
          description: 'Sistema de chat para atención al cliente en tiempo real',
          required: true
        },
        {
          name: 'Sistema de Favoritos',
          description: 'Guardar propiedades favoritas para revisión posterior',
          required: true
        }
      ],
      'Aplicación': [
        {
          name: 'Búsqueda Geolocalizada',
          description: 'Búsqueda de propiedades por ubicación con GPS',
          required: true
        },
        {
          name: 'Notificaciones Push',
          description: 'Alertas sobre nuevas propiedades y ofertas especiales',
          required: true
        },
        {
          name: 'Realidad Aumentada',
          description: 'Visualización de propiedades en AR',
          required: false
        },
        {
          name: 'Sincronización Offline',
          description: 'Acceso a datos sin conexión',
          required: true
        },
        {
          name: 'Sistema de Mensajería',
          description: 'Chat interno con asesores',
          required: true
        },
        {
          name: 'Calendario de Citas',
          description: 'Agendar visitas a propiedades',
          required: true
        }
      ]
    },
    'Retail': {
      'E-Commerce': [
        {
          name: 'Catálogo de Productos',
          description: 'Lista completa de productos con categorías y filtros',
          required: true
        },
        {
          name: 'Carrito de Compras',
          description: 'Sistema de carrito con gestión de productos',
          required: true
        },
        {
          name: 'Pasarela de Pagos',
          description: 'Múltiples métodos de pago seguros',
          required: true
        },
        {
          name: 'Sistema de Inventario',
          description: 'Control de stock en tiempo real',
          required: true
        },
        {
          name: 'Programa de Lealtad',
          description: 'Sistema de puntos y recompensas',
          required: false
        },
        {
          name: 'Reviews y Ratings',
          description: 'Sistema de reseñas de productos',
          required: true
        },
        {
          name: 'Wishlist',
          description: 'Lista de deseos personalizada',
          required: true
        }
      ],
      'Landing': [
        {
          name: 'Catálogo de Productos',
          description: 'Productos destacados con galería',
          required: true
        },
        {
          name: 'Ofertas y Promociones',
          description: 'Sección de ofertas especiales',
          required: true
        },
        {
          name: 'Newsletter',
          description: 'Suscripción para ofertas exclusivas',
          required: true
        },
        {
          name: 'Testimonios',
          description: 'Opiniones de clientes satisfechos',
          required: true
        },
        {
          name: 'Comparador de Precios',
          description: 'Comparación de precios con competencia',
          required: false
        },
        {
          name: 'FAQ Section',
          description: 'Preguntas frecuentes',
          required: true
        }
      ]
    },
    'Financiero': {
      'Landing': [
        {
          name: 'Calculadoras Financieras',
          description: 'Herramientas para calcular préstamos, intereses y cuotas',
          required: true
        },
        {
          name: 'Simuladores de Crédito',
          description: 'Simulación de diferentes tipos de crédito',
          required: true
        },
        {
          name: 'Información de Servicios',
          description: 'Descripción detallada de productos financieros',
          required: true
        },
        {
          name: 'Testimonios de Confianza',
          description: 'Casos de éxito y testimonios de clientes',
          required: true
        },
        {
          name: 'Certificaciones de Seguridad',
          description: 'Información sobre seguridad y regulaciones',
          required: true
        },
        {
          name: 'Centro de Ayuda',
          description: 'FAQ y soporte al cliente',
          required: true
        },
        {
          name: 'Chat Especializado',
          description: 'Atención personalizada para consultas financieras',
          required: true
        }
      ],
      'Aplicación': [
        {
          name: 'Dashboard Personalizado',
          description: 'Vista general de productos y servicios financieros',
          required: true
        },
        {
          name: 'Autenticación 2FA',
          description: 'Seguridad de dos factores',
          required: true
        },
        {
          name: 'Historial de Transacciones',
          description: 'Registro completo de movimientos',
          required: true
        },
        {
          name: 'Alertas y Notificaciones',
          description: 'Notificaciones de movimientos y ofertas',
          required: true
        },
        {
          name: 'Reportes Financieros',
          description: 'Generación de reportes personalizados',
          required: true
        },
        {
          name: 'Soporte Multimoneda',
          description: 'Operaciones en diferentes monedas',
          required: false
        },
        {
          name: 'Backup de Seguridad',
          description: 'Respaldo seguro de información',
          required: true
        }
      ]
    }
  };

  async analyzeWebsiteStructure(request: AIAnalysisRequest): Promise<WebsiteStructure> {
    try {
      // Verificar si la URL tiene protocolo
      let urlToAnalyze = request.url;
      if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
      }

      // Realizar el crawling
      const response = await axios.get(urlToAnalyze, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Extraer información básica
      const title = $('title').text() || 'Sin título';
      
      // Detectar secciones existentes usando IA
      const existingSections = await this.detectExistingSections($, request);
      
      // Obtener secciones esperadas para el rubro y servicio
      const expectedSections = this.getExpectedSections(request.rubro, request.servicio);
      
      // Analizar secciones faltantes
      const missingSections = this.analyzeMissingSections(existingSections, expectedSections);
      
      // Generar secciones recomendadas
      const recommendedSections = this.generateRecommendedSections(request, existingSections, missingSections);
      
      // Calcular score
      const score = this.calculateStructureScore(existingSections, expectedSections);
      
      // Generar análisis general
      const overallAnalysis = this.generateOverallAnalysis(request, existingSections, missingSections, score);

      return {
        url: urlToAnalyze,
        title,
        existing_sections: existingSections,
        missing_sections: missingSections,
        recommended_sections: recommendedSections,
        overall_analysis: overallAnalysis,
        score
      };

    } catch (error) {
      console.error('Error analyzing website structure:', error);
      return this.generateFallbackAnalysis(request);
    }
  }

  private async detectExistingSections($: cheerio.CheerioAPI, request: AIAnalysisRequest): Promise<SectionAnalysis[]> {
    const sections: SectionAnalysis[] = [];
    const pageContent = $.html().toLowerCase();
    
    // Detectar secciones comunes por navegación
    const navigationLinks = $('nav a, .nav a, .menu a, header a').map((i, el) => $(el).text().toLowerCase().trim()).get();
    
    // Detectar secciones por contenido
    const contentSections = this.detectSectionsByContent($, pageContent);
    
    // Combinar detecciones
    const allDetectedSections = [...new Set([...navigationLinks, ...contentSections])];
    
    // Mapear secciones detectadas a secciones estándar
    const sectionMappings: Record<string, string> = {
      'inicio': 'Inicio (Home)',
      'home': 'Inicio (Home)',
      'nosotros': 'Nosotros',
      'about': 'Nosotros',
      'proyectos': 'Proyectos',
      'projects': 'Proyectos',
      'propiedades': 'Proyectos',
      'properties': 'Proyectos',
      'contacto': 'Contacto',
      'contact': 'Contacto',
      'blog': 'Blog',
      'noticias': 'Blog',
      'news': 'Blog',
      'productos': 'Catálogo de Productos',
      'products': 'Catálogo de Productos',
      'catalogo': 'Catálogo de Productos',
      'catalog': 'Catálogo de Productos',
      'servicios': 'Servicios',
      'services': 'Servicios',
      'calculadora': 'Calculadoras Financieras',
      'calculator': 'Calculadoras Financieras',
      'simulador': 'Simuladores de Crédito',
      'simulator': 'Simuladores de Crédito'
    };

    for (const detectedSection of allDetectedSections) {
      const mappedSection = sectionMappings[detectedSection] || detectedSection;
      
      if (!sections.find(s => s.name === mappedSection)) {
        const sectionContent = this.extractSectionContent($, detectedSection);
        
        sections.push({
          name: mappedSection,
          description: this.getSectionDescription(mappedSection, request.rubro),
          found: true,
          content_summary: sectionContent,
          recommendations: this.generateSectionRecommendations(mappedSection, sectionContent, request)
        });
      }
    }

    return sections;
  }

  private detectSectionsByContent($: cheerio.CheerioAPI, pageContent: string): string[] {
    const sections: string[] = [];
    
    // Detectar por contenido específico
    if (pageContent.includes('formulario') || pageContent.includes('contact')) {
      sections.push('contacto');
    }
    
    if (pageContent.includes('proyecto') || pageContent.includes('propiedad')) {
      sections.push('proyectos');
    }
    
    if (pageContent.includes('nosotros') || pageContent.includes('about')) {
      sections.push('nosotros');
    }
    
    if (pageContent.includes('blog') || pageContent.includes('noticia')) {
      sections.push('blog');
    }
    
    if (pageContent.includes('calculadora') || pageContent.includes('simulador')) {
      sections.push('calculadora');
    }
    
    if (pageContent.includes('producto') || pageContent.includes('catalogo')) {
      sections.push('productos');
    }
    
    return sections;
  }

  private extractSectionContent($: cheerio.CheerioAPI, sectionName: string): string {
    // Buscar contenido relacionado con la sección
    const selectors = [
      `[class*="${sectionName}"]`,
      `[id*="${sectionName}"]`,
      `section:contains("${sectionName}")`,
      `div:contains("${sectionName}")`
    ];
    
    let content = '';
    selectors.forEach(selector => {
      const elements = $(selector);
      if (elements.length > 0) {
        content += elements.text().substring(0, 200) + '...';
      }
    });
    
    return content || 'Contenido no disponible';
  }

  private getSectionDescription(sectionName: string, rubro: string): string {
    const descriptions: Record<string, string> = {
      'Inicio (Home)': 'Página principal con navegación y contenido destacado',
      'Nosotros': 'Información sobre la empresa, historia y valores',
      'Proyectos': 'Galería y detalles de proyectos o productos',
      'Contacto': 'Información de contacto y formularios',
      'Blog': 'Artículos y noticias del sector',
      'Catálogo de Productos': 'Lista de productos o servicios disponibles',
      'Calculadoras Financieras': 'Herramientas de cálculo financiero',
      'Simuladores de Crédito': 'Simuladores de préstamos y créditos'
    };
    
    return descriptions[sectionName] || `Sección ${sectionName}`;
  }

  private getExpectedSections(rubro: string, servicio: string): any[] {
    return this.SECTOR_SECTIONS[rubro]?.[servicio] || [];
  }

  private analyzeMissingSections(existingSections: SectionAnalysis[], expectedSections: any[]): SectionAnalysis[] {
    const missing: SectionAnalysis[] = [];
    
    for (const expected of expectedSections) {
      const found = existingSections.find(section => 
        section.name.toLowerCase().includes(expected.name.toLowerCase()) ||
        expected.name.toLowerCase().includes(section.name.toLowerCase())
      );
      
      if (!found) {
        missing.push({
          name: expected.name,
          description: expected.description,
          found: false,
          recommendations: this.generateMissingSectionRecommendations(expected, existingSections)
        });
      }
    }
    
    return missing;
  }

  private generateRecommendedSections(
    request: AIAnalysisRequest, 
    existingSections: SectionAnalysis[], 
    missingSections: SectionAnalysis[]
  ): SectionAnalysis[] {
    const recommended: SectionAnalysis[] = [];
    
    // Agregar secciones faltantes críticas
    const criticalMissing = missingSections.filter(section => 
      this.isCriticalSection(section.name, request.rubro)
    );
    
    recommended.push(...criticalMissing);
    
    // Agregar secciones adicionales según el rubro
    const additionalSections = this.getAdditionalSections(request.rubro, request.servicio);
    
    for (const additional of additionalSections) {
      const alreadyExists = existingSections.find(section => 
        section.name.toLowerCase().includes(additional.name.toLowerCase())
      );
      
      if (!alreadyExists) {
        recommended.push({
          name: additional.name,
          description: additional.description,
          found: false,
          recommendations: [`Implementar ${additional.name} para mejorar la experiencia del usuario`]
        });
      }
    }
    
    return recommended;
  }

  private isCriticalSection(sectionName: string, rubro: string): boolean {
    const criticalSections: Record<string, string[]> = {
      'Inmobiliario': ['Inicio (Home)', 'Proyectos', 'Contacto'],
      'Retail': ['Catálogo de Productos', 'Contacto'],
      'Financiero': ['Calculadoras Financieras', 'Contacto']
    };
    
    return criticalSections[rubro]?.some(critical => 
      sectionName.toLowerCase().includes(critical.toLowerCase())
    ) || false;
  }

  private getAdditionalSections(rubro: string, servicio: string): any[] {
    const additional: any[] = [];
    
    if (rubro === 'Inmobiliario') {
      additional.push(
        { name: 'Vende tu Terreno', description: 'Programa de referidos inmobiliarios' },
        { name: 'Refiere y Gana', description: 'Blog de noticias del sector' }
      );
    }
    
    if (servicio === 'E-Commerce') {
      additional.push(
        { name: 'Carrito de Compras', description: 'Sistema de compras online' },
        { name: 'Pasarela de Pagos', description: 'Métodos de pago seguros' }
      );
    }
    
    return additional;
  }

  private generateSectionRecommendations(sectionName: string, content: string, request: AIAnalysisRequest): string[] {
    const recommendations: string[] = [];
    
    if (sectionName === 'Inicio (Home)') {
      if (!content.includes('slider') && !content.includes('carousel')) {
        recommendations.push('Agregar slider de imágenes o videos destacados');
      }
      if (!content.includes('formulario')) {
        recommendations.push('Incluir formulario de contacto o cotización');
      }
    }
    
    if (sectionName === 'Proyectos') {
      if (!content.includes('filtro')) {
        recommendations.push('Implementar filtros de búsqueda avanzados');
      }
      if (!content.includes('galería')) {
        recommendations.push('Agregar galería de imágenes de proyectos');
      }
    }
    
    if (sectionName === 'Contacto') {
      if (!content.includes('mapa')) {
        recommendations.push('Incluir mapa de ubicación');
      }
      if (!content.includes('teléfono') && !content.includes('email')) {
        recommendations.push('Agregar información de contacto completa');
      }
    }
    
    return recommendations;
  }

  private generateMissingSectionRecommendations(expectedSection: any, existingSections: SectionAnalysis[]): string[] {
    const recommendations: string[] = [];
    
    recommendations.push(`Implementar sección "${expectedSection.name}"`);
    recommendations.push(`Agregar contenido relevante: ${expectedSection.description}`);
    
    if (expectedSection.required) {
      recommendations.push('Esta sección es crítica para el sector seleccionado');
    }
    
    return recommendations;
  }

  private calculateStructureScore(existingSections: SectionAnalysis[], expectedSections: any[]): number {
    const totalExpected = expectedSections.length;
    const foundSections = existingSections.length;
    const criticalFound = existingSections.filter(section => 
      expectedSections.some(expected => 
        expected.name.toLowerCase().includes(section.name.toLowerCase()) && expected.required
      )
    ).length;
    
    const criticalExpected = expectedSections.filter(section => section.required).length;
    
    // Score basado en secciones encontradas (60%) y críticas (40%)
    const basicScore = (foundSections / totalExpected) * 60;
    const criticalScore = (criticalFound / criticalExpected) * 40;
    
    return Math.round(basicScore + criticalScore);
  }

  private generateOverallAnalysis(
    request: AIAnalysisRequest,
    existingSections: SectionAnalysis[],
    missingSections: SectionAnalysis[],
    score: number
  ): string {
    const criticalMissing = missingSections.filter(section => 
      this.isCriticalSection(section.name, request.rubro)
    );
    
    // Generar análisis en formato específico según el rubro
    if (request.rubro === 'Inmobiliario') {
      return this.generateInmobiliarioAnalysis(existingSections, missingSections);
    } else if (request.rubro === 'Retail') {
      return this.generateRetailAnalysis(existingSections, missingSections);
    } else if (request.rubro === 'Financiero') {
      return this.generateFinancieroAnalysis(existingSections, missingSections);
    }
    
    // Análisis genérico para otros rubros
    return this.generateGenericAnalysis(existingSections, missingSections, request.rubro);
  }

  private generateInmobiliarioAnalysis(existingSections: SectionAnalysis[], missingSections: SectionAnalysis[]): string {
    let analysis = `ANÁLISIS DE ESTRUCTURA WEB - SECTOR INMOBILIARIO\n\n`;
    
    // Sección 1: Inicio (Home)
    const hasInicio = existingSections.find(s => s.name.toLowerCase().includes('inicio') || s.name.toLowerCase().includes('home'));
    analysis += `1. Inicio (Home):\n`;
    if (hasInicio) {
      analysis += `✅ Cabecera (Header): Contiene el logotipo de la empresa y un menú de navegación.\n`;
      analysis += `✅ Slider de Imágenes: Presenta video o imágenes de proyectos inmobiliarios destacados con textos llamativos\n`;
      analysis += `✅ Destacados de Proyectos: Sección que muestra algunos proyectos destacados de la empresa.\n`;
      analysis += `✅ Filtro de búsqueda personalizado.\n`;
      analysis += `✅ Formulario de cotiza tu depa.\n`;
      analysis += `✅ Footer: Incluye enlaces a páginas importantes, información de contacto y enlaces a redes sociales.\n`;
    } else {
      analysis += `❌ Cabecera (Header): Contiene el logotipo de la empresa y un menú de navegación.\n`;
      analysis += `❌ Slider de Imágenes: Presenta video o imágenes de proyectos inmobiliarios destacados con textos llamativos\n`;
      analysis += `❌ Destacados de Proyectos: Sección que muestra algunos proyectos destacados de la empresa.\n`;
      analysis += `❌ Filtro de búsqueda personalizado.\n`;
      analysis += `❌ Formulario de cotiza tu depa.\n`;
      analysis += `❌ Footer: Incluye enlaces a páginas importantes, información de contacto y enlaces a redes sociales.\n`;
    }
    
    // Sección 2: Nosotros
    const hasNosotros = existingSections.find(s => s.name.toLowerCase().includes('nosotros') || s.name.toLowerCase().includes('about'));
    analysis += `\n2. Nosotros:\n`;
    if (hasNosotros) {
      analysis += `✅ Historia de la Empresa: Información sobre la historia, valores y filosofía de la empresa.\n`;
      analysis += `✅ Nuestros proyectos en una línea de tiempo.\n`;
      analysis += `✅ Formulario de cotiza tu nuevo tu depa.\n`;
    } else {
      analysis += `❌ Historia de la Empresa: Información sobre la historia, valores y filosofía de la empresa.\n`;
      analysis += `❌ Nuestros proyectos en una línea de tiempo.\n`;
      analysis += `❌ Formulario de cotiza tu nuevo tu depa.\n`;
    }
    
    // Sección 3: Proyectos
    const hasProyectos = existingSections.find(s => s.name.toLowerCase().includes('proyecto') || s.name.toLowerCase().includes('propiedad'));
    analysis += `\n3. Proyectos:\n`;
    if (hasProyectos) {
      analysis += `✅ Galería de Proyectos: Presenta una lista de proyectos inmobiliarios desarrollados por la empresa.\n`;
      analysis += `✅ Filtros de Búsqueda: Filtro básico de proyectos por ubicación y tipo (departamentos, casas, etc.). Filtro avanzado por cantidad de dormitorios, baños, metraje, áreas comunes.\n`;
      analysis += `✅ Páginas de Proyectos Individuales: Cada proyecto tiene su propia página con imágenes, descripción y detalles específicos.\n`;
    } else {
      analysis += `❌ Galería de Proyectos: Presenta una lista de proyectos inmobiliarios desarrollados por la empresa.\n`;
      analysis += `❌ Filtros de Búsqueda: Filtro básico de proyectos por ubicación y tipo (departamentos, casas, etc.). Filtro avanzado por cantidad de dormitorios, baños, metraje, áreas comunes.\n`;
      analysis += `❌ Páginas de Proyectos Individuales: Cada proyecto tiene su propia página con imágenes, descripción y detalles específicos.\n`;
    }
    
    // Sección 4: Detalle del proyecto
    analysis += `\n4. Detalle del proyecto:\n`;
    analysis += `✅ Slider del proyecto: Presenta video o imagen del proyecto, con textos llamativos, destacando características importantes como distrito o estado.\n`;
    analysis += `✅ Presentación del proyecto: Breve descripción resaltando sus beneficios.\n`;
    analysis += `✅ Detalles del proyecto: Listado iconográfico de las características del proyecto, imagen de fachada del proyecto y botones de llamada a la acción para descargar brochure u otra información relevante.\n`;
    analysis += `✅ Avances de Obra: Línea temporal del proyecto y su avance en cada estado.\n`;
    analysis += `✅ Concepto: Presentación y sustento del concepto del proyecto, reforzado con imágenes y texto.\n`;
    analysis += `✅ Galería de imágenes de interiores.\n`;
    analysis += `✅ Galería de imágenes de áreas comunes.\n`;
    analysis += `✅ Recorrido virtual.\n`;
    analysis += `✅ Video del proyecto.\n`;
    analysis += `✅ Mapa de ubicación de Google Maps con filtros de lugares de interés, y llamada de acción para ir con Google o Waze.\n`;
    analysis += `✅ Formulario de cotización: Listado de planos y tipologías con filtros por cantidad de dormitorios, baños, piso u otros de interés.\n`;
    analysis += `✅ Listado de asesores con su información de contacto y ubicación de la sala de ventas.\n`;
    analysis += `✅ Listado de otros proyectos que pueden ser de interés para el usuario.\n`;
    
    // Sección 5: Vende tu terreno
    const hasVendeTerreno = existingSections.find(s => s.name.toLowerCase().includes('vende') || s.name.toLowerCase().includes('terreno'));
    analysis += `\n5. Vende tu terreno:\n`;
    if (hasVendeTerreno) {
      analysis += `✅ Imagen y descripción de los premios y beneficios de pertenecer al programa de referidos.\n`;
      analysis += `✅ Pasos a seguir para poder referir.\n`;
      analysis += `✅ Formulario de Déjanos tus datos y datos de la persona a quien refiere.\n`;
    } else {
      analysis += `❌ Imagen y descripción de los premios y beneficios de pertenecer al programa de referidos.\n`;
      analysis += `❌ Pasos a seguir para poder referir.\n`;
      analysis += `❌ Formulario de Déjanos tus datos y datos de la persona a quien refiere.\n`;
    }
    
    // Sección 6: Refiere y gana
    const hasBlog = existingSections.find(s => s.name.toLowerCase().includes('blog') || s.name.toLowerCase().includes('noticia'));
    analysis += `\n6. Refiere y gana:\n`;
    if (hasBlog) {
      analysis += `✅ Blog o Noticias: Artículos sobre novedades, eventos o noticias relacionadas con la empresa y la industria inmobiliaria.\n`;
    } else {
      analysis += `❌ Blog o Noticias: Artículos sobre novedades, eventos o noticias relacionadas con la empresa y la industria inmobiliaria.\n`;
    }
    
    // Sección 7: Contacto
    const hasContacto = existingSections.find(s => s.name.toLowerCase().includes('contacto') || s.name.toLowerCase().includes('contact'));
    analysis += `\n7. Contacto:\n`;
    if (hasContacto) {
      analysis += `✅ Formulario de cotiza tu nuevo tu depa.\n`;
    } else {
      analysis += `❌ Formulario de cotiza tu nuevo tu depa.\n`;
    }
    
    return analysis;
  }

  private generateRetailAnalysis(existingSections: SectionAnalysis[], missingSections: SectionAnalysis[]): string {
    let analysis = `ANÁLISIS DE ESTRUCTURA WEB - SECTOR RETAIL\n\n`;
    
    // Sección 1: Inicio (Home)
    const hasInicio = existingSections.find(s => s.name.toLowerCase().includes('inicio') || s.name.toLowerCase().includes('home'));
    analysis += `1. Inicio (Home):\n`;
    if (hasInicio) {
      analysis += `✅ Cabecera (Header): Contiene el logotipo de la empresa y un menú de navegación.\n`;
      analysis += `✅ Catálogo de Productos: Productos destacados con galería atractiva.\n`;
      analysis += `✅ Ofertas y Promociones: Sección de ofertas especiales y descuentos.\n`;
      analysis += `✅ Newsletter: Suscripción para ofertas exclusivas.\n`;
      analysis += `✅ Testimonios: Opiniones de clientes satisfechos.\n`;
      analysis += `✅ Footer: Enlaces importantes, información de contacto y redes sociales.\n`;
    } else {
      analysis += `❌ Cabecera (Header): Contiene el logotipo de la empresa y un menú de navegación.\n`;
      analysis += `❌ Catálogo de Productos: Productos destacados con galería atractiva.\n`;
      analysis += `❌ Ofertas y Promociones: Sección de ofertas especiales y descuentos.\n`;
      analysis += `❌ Newsletter: Suscripción para ofertas exclusivas.\n`;
      analysis += `❌ Testimonios: Opiniones de clientes satisfechos.\n`;
      analysis += `❌ Footer: Enlaces importantes, información de contacto y redes sociales.\n`;
    }
    
    // Sección 2: Catálogo de Productos
    const hasCatalogo = existingSections.find(s => s.name.toLowerCase().includes('catalogo') || s.name.toLowerCase().includes('producto'));
    analysis += `\n2. Catálogo de Productos:\n`;
    if (hasCatalogo) {
      analysis += `✅ Lista completa de productos con categorías y filtros.\n`;
      analysis += `✅ Sistema de carrito de compras optimizado.\n`;
      analysis += `✅ Múltiples opciones de pago seguras.\n`;
      analysis += `✅ Sistema de inventario en tiempo real.\n`;
      analysis += `✅ Reviews y ratings de productos.\n`;
      analysis += `✅ Wishlist personalizada.\n`;
    } else {
      analysis += `❌ Lista completa de productos con categorías y filtros.\n`;
      analysis += `❌ Sistema de carrito de compras optimizado.\n`;
      analysis += `❌ Múltiples opciones de pago seguras.\n`;
      analysis += `❌ Sistema de inventario en tiempo real.\n`;
      analysis += `❌ Reviews y ratings de productos.\n`;
      analysis += `❌ Wishlist personalizada.\n`;
    }
    
    // Sección 3: Programa de Lealtad
    analysis += `\n3. Programa de Lealtad:\n`;
    analysis += `✅ Sistema de puntos y recompensas.\n`;
    analysis += `✅ Historial de compras del cliente.\n`;
    analysis += `✅ Ofertas exclusivas para miembros.\n`;
    analysis += `✅ Niveles de membresía con beneficios diferenciados.\n`;
    
    // Sección 4: Comparador de Precios
    analysis += `\n4. Comparador de Precios:\n`;
    analysis += `✅ Comparación de precios con competencia.\n`;
    analysis += `✅ Alertas de precios.\n`;
    analysis += `✅ Historial de precios.\n`;
    
    // Sección 5: FAQ Section
    analysis += `\n5. FAQ Section:\n`;
    analysis += `✅ Preguntas frecuentes organizadas por categorías.\n`;
    analysis += `✅ Sistema de búsqueda en FAQs.\n`;
    analysis += `✅ Formulario de contacto para consultas específicas.\n`;
    
    // Sección 6: Contacto
    const hasContacto = existingSections.find(s => s.name.toLowerCase().includes('contacto') || s.name.toLowerCase().includes('contact'));
    analysis += `\n6. Contacto:\n`;
    if (hasContacto) {
      analysis += `✅ Formulario de contacto optimizado.\n`;
      analysis += `✅ Información de ubicación y horarios.\n`;
      analysis += `✅ Chat en vivo para atención al cliente.\n`;
    } else {
      analysis += `❌ Formulario de contacto optimizado.\n`;
      analysis += `❌ Información de ubicación y horarios.\n`;
      analysis += `❌ Chat en vivo para atención al cliente.\n`;
    }
    
    return analysis;
  }

  private generateFinancieroAnalysis(existingSections: SectionAnalysis[], missingSections: SectionAnalysis[]): string {
    let analysis = `ANÁLISIS DE ESTRUCTURA WEB - SECTOR FINANCIERO\n\n`;
    
    // Sección 1: Inicio (Home)
    const hasInicio = existingSections.find(s => s.name.toLowerCase().includes('inicio') || s.name.toLowerCase().includes('home'));
    analysis += `1. Inicio (Home):\n`;
    if (hasInicio) {
      analysis += `✅ Cabecera (Header): Contiene el logotipo de la institución y menú de navegación.\n`;
      analysis += `✅ Información de Servicios: Descripción clara de productos financieros.\n`;
      analysis += `✅ Testimonios de Confianza: Casos de éxito y testimonios de clientes.\n`;
      analysis += `✅ Certificaciones de Seguridad: Información sobre regulaciones y seguridad.\n`;
      analysis += `✅ Footer: Enlaces importantes y información de contacto.\n`;
    } else {
      analysis += `❌ Cabecera (Header): Contiene el logotipo de la institución y menú de navegación.\n`;
      analysis += `❌ Información de Servicios: Descripción clara de productos financieros.\n`;
      analysis += `❌ Testimonios de Confianza: Casos de éxito y testimonios de clientes.\n`;
      analysis += `❌ Certificaciones de Seguridad: Información sobre regulaciones y seguridad.\n`;
      analysis += `❌ Footer: Enlaces importantes y información de contacto.\n`;
    }
    
    // Sección 2: Calculadoras Financieras
    const hasCalculadora = existingSections.find(s => s.name.toLowerCase().includes('calculadora'));
    analysis += `\n2. Calculadoras Financieras:\n`;
    if (hasCalculadora) {
      analysis += `✅ Herramientas para calcular préstamos, intereses y cuotas.\n`;
      analysis += `✅ Simuladores de diferentes tipos de crédito.\n`;
      analysis += `✅ Calculadora de hipotecas.\n`;
      analysis += `✅ Calculadora de inversiones.\n`;
    } else {
      analysis += `❌ Herramientas para calcular préstamos, intereses y cuotas.\n`;
      analysis += `❌ Simuladores de diferentes tipos de crédito.\n`;
      analysis += `❌ Calculadora de hipotecas.\n`;
      analysis += `❌ Calculadora de inversiones.\n`;
    }
    
    // Sección 3: Centro de Ayuda
    analysis += `\n3. Centro de Ayuda:\n`;
    analysis += `✅ FAQ organizadas por categorías.\n`;
    analysis += `✅ Sistema de tickets de soporte.\n`;
    analysis += `✅ Chat especializado para consultas financieras.\n`;
    analysis += `✅ Base de conocimientos con artículos informativos.\n`;
    
    // Sección 4: Portal de Clientes
    analysis += `\n4. Portal de Clientes:\n`;
    analysis += `✅ Dashboard personalizado con resumen de productos.\n`;
    analysis += `✅ Autenticación de dos factores (2FA).\n`;
    analysis += `✅ Historial completo de transacciones.\n`;
    analysis += `✅ Alertas y notificaciones personalizadas.\n`;
    analysis += `✅ Generación de reportes financieros.\n`;
    analysis += `✅ Soporte para múltiples monedas.\n`;
    
    // Sección 5: Seguridad
    analysis += `\n5. Seguridad:\n`;
    analysis += `✅ Información sobre certificaciones de seguridad.\n`;
    analysis += `✅ Políticas de privacidad y protección de datos.\n`;
    analysis += `✅ Encriptación de datos y transacciones.\n`;
    analysis += `✅ Backup de seguridad de información.\n`;
    
    // Sección 6: Contacto
    const hasContacto = existingSections.find(s => s.name.toLowerCase().includes('contacto') || s.name.toLowerCase().includes('contact'));
    analysis += `\n6. Contacto:\n`;
    if (hasContacto) {
      analysis += `✅ Formulario de contacto especializado.\n`;
      analysis += `✅ Información de sucursales y horarios.\n`;
      analysis += `✅ Chat en vivo para consultas financieras.\n`;
    } else {
      analysis += `❌ Formulario de contacto especializado.\n`;
      analysis += `❌ Información de sucursales y horarios.\n`;
      analysis += `❌ Chat en vivo para consultas financieras.\n`;
    }
    
    return analysis;
  }

  private generateGenericAnalysis(existingSections: SectionAnalysis[], missingSections: SectionAnalysis[], rubro: string): string {
    let analysis = `ANÁLISIS DE ESTRUCTURA WEB - SECTOR ${rubro.toUpperCase()}\n\n`;
    
    // Sección 1: Inicio (Home)
    const hasInicio = existingSections.find(s => s.name.toLowerCase().includes('inicio') || s.name.toLowerCase().includes('home'));
    analysis += `1. Inicio (Home):\n`;
    if (hasInicio) {
      analysis += `✅ Cabecera (Header): Contiene el logotipo de la empresa y menú de navegación.\n`;
      analysis += `✅ Contenido destacado del sector.\n`;
      analysis += `✅ Formulario de contacto o cotización.\n`;
      analysis += `✅ Footer con información de contacto y enlaces importantes.\n`;
    } else {
      analysis += `❌ Cabecera (Header): Contiene el logotipo de la empresa y menú de navegación.\n`;
      analysis += `❌ Contenido destacado del sector.\n`;
      analysis += `❌ Formulario de contacto o cotización.\n`;
      analysis += `❌ Footer con información de contacto y enlaces importantes.\n`;
    }
    
    // Sección 2: Nosotros
    const hasNosotros = existingSections.find(s => s.name.toLowerCase().includes('nosotros') || s.name.toLowerCase().includes('about'));
    analysis += `\n2. Nosotros:\n`;
    if (hasNosotros) {
      analysis += `✅ Historia de la empresa, valores y filosofía.\n`;
      analysis += `✅ Información sobre el equipo y la empresa.\n`;
      analysis += `✅ Certificaciones y reconocimientos del sector.\n`;
    } else {
      analysis += `❌ Historia de la empresa, valores y filosofía.\n`;
      analysis += `❌ Información sobre el equipo y la empresa.\n`;
      analysis += `❌ Certificaciones y reconocimientos del sector.\n`;
    }
    
    // Sección 3: Servicios/Productos
    const hasServicios = existingSections.find(s => s.name.toLowerCase().includes('servicio') || s.name.toLowerCase().includes('producto'));
    analysis += `\n3. Servicios/Productos:\n`;
    if (hasServicios) {
      analysis += `✅ Catálogo o lista de servicios ofrecidos.\n`;
      analysis += `✅ Descripción detallada de cada servicio.\n`;
      analysis += `✅ Formularios de cotización o contacto.\n`;
    } else {
      analysis += `❌ Catálogo o lista de servicios ofrecidos.\n`;
      analysis += `❌ Descripción detallada de cada servicio.\n`;
      analysis += `❌ Formularios de cotización o contacto.\n`;
    }
    
    // Sección 4: Blog/Noticias
    const hasBlog = existingSections.find(s => s.name.toLowerCase().includes('blog') || s.name.toLowerCase().includes('noticia'));
    analysis += `\n4. Blog/Noticias:\n`;
    if (hasBlog) {
      analysis += `✅ Artículos sobre novedades del sector.\n`;
      analysis += `✅ Información actualizada sobre la empresa.\n`;
      analysis += `✅ Contenido educativo relacionado al sector.\n`;
    } else {
      analysis += `❌ Artículos sobre novedades del sector.\n`;
      analysis += `❌ Información actualizada sobre la empresa.\n`;
      analysis += `❌ Contenido educativo relacionado al sector.\n`;
    }
    
    // Sección 5: Contacto
    const hasContacto = existingSections.find(s => s.name.toLowerCase().includes('contacto') || s.name.toLowerCase().includes('contact'));
    analysis += `\n5. Contacto:\n`;
    if (hasContacto) {
      analysis += `✅ Formulario de contacto optimizado.\n`;
      analysis += `✅ Información de ubicación y horarios.\n`;
      analysis += `✅ Múltiples canales de comunicación.\n`;
    } else {
      analysis += `❌ Formulario de contacto optimizado.\n`;
      analysis += `❌ Información de ubicación y horarios.\n`;
      analysis += `❌ Múltiples canales de comunicación.\n`;
    }
    
    return analysis;
  }

  private generateFallbackAnalysis(request: AIAnalysisRequest): WebsiteStructure {
    const expectedSections = this.getExpectedSections(request.rubro, request.servicio);
    
    return {
      url: request.url,
      title: 'Análisis no disponible',
      existing_sections: [],
      missing_sections: expectedSections.map(section => ({
        name: section.name,
        description: section.description,
        found: false,
        recommendations: [`Implementar ${section.name} para mejorar la estructura del sitio`]
      })),
      recommended_sections: expectedSections.map(section => ({
        name: section.name,
        description: section.description,
        found: false,
        recommendations: [`Agregar ${section.name} como sección esencial`]
      })),
      overall_analysis: `No se pudo analizar la estructura de ${request.url}. Se recomienda implementar las secciones estándar para ${request.rubro.toLowerCase()}.`,
      score: 0
    };
  }
} 