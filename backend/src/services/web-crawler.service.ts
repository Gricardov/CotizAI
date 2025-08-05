import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface CrawlAnalysisRequest {
  url: string;
  rubro: string;
  servicio: string;
  tipo: string;
}

interface AnalysisResult {
  url: string;
  title: string;
  description: string;
  missing_features: string[];
  recommendations: string[];
  seo_analysis: {
    has_meta_description: boolean;
    has_meta_keywords: boolean;
    has_h1_tags: boolean;
    has_alt_texts: boolean;
    page_speed_issues: string[];
  };
  design_analysis: {
    is_responsive: boolean;
    has_modern_design: boolean;
    navigation_issues: string[];
    ux_issues: string[];
  };
  content_analysis: {
    content_quality: string;
    missing_sections: string[];
    engagement_elements: string[];
  };
  technical_analysis: {
    has_ssl: boolean;
    has_contact_forms: boolean;
    has_social_media: boolean;
    has_analytics: boolean;
  };
  overall_score: number;
  detailed_analysis: string;
}

@Injectable()
export class WebCrawlerService {
  private readonly EXPECTED_FEATURES: Record<string, Record<string, string[]>> = {
    'Inmobiliario': {
      'Landing': [
        'Galería de propiedades destacadas',
        'Mapa de ubicaciones',
        'Calculadora de préstamos',
        'Formulario de contacto especializado',
        'Testimonios de clientes',
        'Tours virtuales',
        'Filtros de búsqueda avanzada'
      ],
      'E-Commerce': [
        'Catálogo de propiedades',
        'Sistema de reservas online',
        'Pasarela de pagos',
        'Panel de usuario',
        'Sistema de favoritos',
        'Comparador de propiedades',
        'Chat en vivo'
      ],
      'Aplicación': [
        'Búsqueda geolocalizada',
        'Notificaciones push',
        'Realidad aumentada',
        'Sincronización offline',
        'Sistema de mensajería',
        'Calendario de citas',
        'Integración con redes sociales'
      ]
    },
    'Retail': {
      'E-Commerce': [
        'Carrito de compras',
        'Pasarela de pagos múltiple',
        'Sistema de inventario',
        'Programa de lealtad',
        'Recomendaciones personalizadas',
        'Reviews y ratings',
        'Wishlist'
      ],
      'Landing': [
        'Catálogo de productos',
        'Ofertas y promociones',
        'Newsletter',
        'Testimonios',
        'Galería de productos',
        'Comparador de precios',
        'FAQ section'
      ]
    },
    'Financiero': {
      'Landing': [
        'Calculadoras financieras',
        'Simuladores de crédito',
        'Información de servicios',
        'Testimonios de confianza',
        'Certificaciones de seguridad',
        'Centro de ayuda',
        'Chat especializado'
      ],
      'Aplicación': [
        'Dashboard personalizado',
        'Autenticación 2FA',
        'Histórial de transacciones',
        'Alertas y notificaciones',
        'Reportes financieros',
        'Soporte multimoneda',
        'Backup de seguridad'
      ]
    }
  };

  async analyzePage(request: CrawlAnalysisRequest): Promise<AnalysisResult> {
    try {
      // Verificar si la URL tiene protocolo
      let urlToAnalyze = request.url;
      if (!urlToAnalyze.startsWith('http://') && !urlToAnalyze.startsWith('https://')) {
        urlToAnalyze = 'https://' + urlToAnalyze;
      }

      // Realizar el crawling
      const response = await axios.get(urlToAnalyze, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Análisis básico de la página
      const title = $('title').text() || 'Sin título';
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Análisis SEO
      const seoAnalysis = {
        has_meta_description: !!metaDescription,
        has_meta_keywords: !!$('meta[name="keywords"]').attr('content'),
        has_h1_tags: $('h1').length > 0,
        has_alt_texts: $('img[alt]').length > $('img').length * 0.8,
        page_speed_issues: this.analyzePageSpeed($)
      };

      // Análisis de diseño
      const designAnalysis = {
        is_responsive: this.checkResponsiveDesign($),
        has_modern_design: this.checkModernDesign($),
        navigation_issues: this.analyzeNavigation($),
        ux_issues: this.analyzeUX($)
      };

      // Análisis de contenido
      const contentAnalysis = {
        content_quality: this.analyzeContentQuality($),
        missing_sections: this.findMissingSections($, request.rubro, request.servicio),
        engagement_elements: this.findEngagementElements($)
      };

      // Análisis técnico
      const technicalAnalysis = {
        has_ssl: urlToAnalyze.startsWith('https://'),
        has_contact_forms: $('form').length > 0,
        has_social_media: this.checkSocialMedia($),
        has_analytics: this.checkAnalytics($)
      };

      // Características esperadas según el rubro y servicio
      const expectedFeatures = this.EXPECTED_FEATURES[request.rubro]?.[request.servicio] || [];
      const missingFeatures = this.findMissingFeatures($, expectedFeatures);

      // Generar recomendaciones
      const recommendations = this.generateRecommendations(
        seoAnalysis, 
        designAnalysis, 
        contentAnalysis, 
        technicalAnalysis, 
        missingFeatures,
        request
      );

      // Calcular score general
      const overallScore = this.calculateOverallScore(
        seoAnalysis, 
        designAnalysis, 
        contentAnalysis, 
        technicalAnalysis
      );

      // Generar análisis detallado
      const detailedAnalysis = this.generateDetailedAnalysis(
        request,
        missingFeatures,
        recommendations,
        overallScore
      );

      return {
        url: urlToAnalyze,
        title,
        description: metaDescription,
        missing_features: missingFeatures,
        recommendations,
        seo_analysis: seoAnalysis,
        design_analysis: designAnalysis,
        content_analysis: contentAnalysis,
        technical_analysis: technicalAnalysis,
        overall_score: overallScore,
        detailed_analysis: detailedAnalysis
      };

    } catch (error) {
      console.error('Error analyzing page:', error);
      
      // Retornar análisis genérico en caso de error
      return this.generateFallbackAnalysis(request);
    }
  }

  private analyzePageSpeed($: cheerio.CheerioAPI): string[] {
    const issues: string[] = [];
    
    if ($('script').length > 10) {
      issues.push('Exceso de scripts JavaScript pueden afectar la velocidad de carga');
    }
    
    if ($('img').length > 20) {
      issues.push('Gran cantidad de imágenes sin optimizar detectadas');
    }
    
    if ($('link[rel="stylesheet"]').length > 5) {
      issues.push('Múltiples archivos CSS externos pueden ralentizar la carga');
    }

    return issues;
  }

  private checkResponsiveDesign($: cheerio.CheerioAPI): boolean {
    const viewport = $('meta[name="viewport"]').attr('content');
    const hasMediaQueries = $('style, link[rel="stylesheet"]').text().includes('@media');
    return !!viewport || hasMediaQueries;
  }

  private checkModernDesign($: cheerio.CheerioAPI): boolean {
    const modernFrameworks = ['bootstrap', 'tailwind', 'material', 'chakra'];
    const pageContent = $.html().toLowerCase();
    return modernFrameworks.some(framework => pageContent.includes(framework));
  }

  private analyzeNavigation($: cheerio.CheerioAPI): string[] {
    const issues: string[] = [];
    
    const navElements = $('nav, .nav, .navigation, .menu').length;
    if (navElements === 0) {
      issues.push('No se detectó un sistema de navegación claro');
    }
    
    const menuItems = $('nav a, .nav a, .menu a').length;
    if (menuItems > 10) {
      issues.push('Demasiados elementos en el menú principal');
    }
    
    return issues;
  }

  private analyzeUX($: cheerio.CheerioAPI): string[] {
    const issues: string[] = [];
    
    if ($('button, .btn, input[type="submit"]').length < 2) {
      issues.push('Pocos elementos de llamada a la acción (CTA)');
    }
    
    if (!$('footer').length) {
      issues.push('Falta de información de contacto en footer');
    }
    
    return issues;
  }

  private analyzeContentQuality($: cheerio.CheerioAPI): string {
    const textContent = $('p, div, span').text();
    const wordCount = textContent.split(' ').length;
    
    if (wordCount < 300) return 'Contenido insuficiente';
    if (wordCount < 800) return 'Contenido básico';
    if (wordCount < 1500) return 'Contenido adecuado';
    return 'Contenido extenso';
  }

  private findMissingSections($: cheerio.CheerioAPI, rubro: string, servicio: string): string[] {
    const missing: string[] = [];
    const pageText = $.html().toLowerCase();
    
    const commonSections = ['about', 'sobre', 'contacto', 'contact', 'services', 'servicios'];
    commonSections.forEach(section => {
      if (!pageText.includes(section)) {
        missing.push(`Sección ${section}`);
      }
    });
    
    return missing;
  }

  private findEngagementElements($: cheerio.CheerioAPI): string[] {
    const elements: string[] = [];
    
    if ($('form').length > 0) elements.push('Formularios de contacto');
    if ($('.testimonial, .review').length > 0) elements.push('Testimonios');
    if ($('.social, .share').length > 0) elements.push('Redes sociales');
    if ($('video, iframe[src*="youtube"]').length > 0) elements.push('Contenido multimedia');
    
    return elements;
  }

  private checkSocialMedia($: cheerio.CheerioAPI): boolean {
    const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
    const pageContent = $.html().toLowerCase();
    return socialPlatforms.some(platform => pageContent.includes(platform));
  }

  private checkAnalytics($: cheerio.CheerioAPI): boolean {
    const analyticsServices = ['google-analytics', 'gtag', 'ga(', 'facebook pixel'];
    const pageContent = $.html().toLowerCase();
    return analyticsServices.some(service => pageContent.includes(service));
  }

  private findMissingFeatures($: cheerio.CheerioAPI, expectedFeatures: string[]): string[] {
    const pageContent = $.html().toLowerCase();
    const missing: string[] = [];
    
    expectedFeatures.forEach((feature: string) => {
      const keywords = feature.toLowerCase().split(' ');
      const hasFeature = keywords.some(keyword => pageContent.includes(keyword));
      
      if (!hasFeature) {
        missing.push(feature);
      }
    });
    
    return missing;
  }

  private generateRecommendations(
    seo: any,
    design: any,
    content: any,
    technical: any,
    missingFeatures: string[],
    request: CrawlAnalysisRequest
  ): string[] {
    const recommendations: string[] = [];
    
    if (!seo.has_meta_description) {
      recommendations.push('Agregar meta descripción optimizada para SEO');
    }
    
    if (!design.is_responsive) {
      recommendations.push('Implementar diseño responsive para dispositivos móviles');
    }
    
    if (content.content_quality === 'Contenido insuficiente') {
      recommendations.push('Ampliar el contenido con información relevante del sector');
    }
    
    if (!technical.has_ssl) {
      recommendations.push('Implementar certificado SSL para mayor seguridad');
    }
    
    if (missingFeatures.length > 0) {
      recommendations.push(`Agregar funcionalidades específicas para ${request.rubro}: ${missingFeatures.slice(0, 3).join(', ')}`);
    }
    
    return recommendations;
  }

  private calculateOverallScore(seo: any, design: any, content: any, technical: any): number {
    let score = 0;
    
    // SEO (25%)
    if (seo.has_meta_description) score += 6.25;
    if (seo.has_h1_tags) score += 6.25;
    if (seo.has_alt_texts) score += 6.25;
    if (seo.has_meta_keywords) score += 6.25;
    
    // Diseño (25%)
    if (design.is_responsive) score += 12.5;
    if (design.has_modern_design) score += 12.5;
    
    // Contenido (25%)
    if (content.content_quality !== 'Contenido insuficiente') score += 25;
    
    // Técnico (25%)
    if (technical.has_ssl) score += 8.33;
    if (technical.has_contact_forms) score += 8.33;
    if (technical.has_analytics) score += 8.34;
    
    return Math.round(score);
  }

  private generateDetailedAnalysis(
    request: CrawlAnalysisRequest,
    missingFeatures: string[],
    recommendations: string[],
    score: number
  ): string {
    return `ANÁLISIS DETALLADO DE LA PÁGINA WEB: ${request.url}

EVALUACIÓN GENERAL:
Puntuación obtenida: ${score}/100 puntos

ANÁLISIS ESPECÍFICO PARA ${request.rubro.toUpperCase()} - ${request.servicio.toUpperCase()}:

La evaluación de su sitio web actual revela oportunidades significativas de mejora para optimizar su presencia digital en el sector ${request.rubro.toLowerCase()}. 

FUNCIONALIDADES FALTANTES CRÍTICAS:
${missingFeatures.length > 0 ? 
  missingFeatures.map(feature => `• ${feature}`).join('\n') : 
  '• Su sitio web cuenta con las funcionalidades básicas esperadas'}

RECOMENDACIONES PRIORITARIAS:
${recommendations.map(rec => `• ${rec}`).join('\n')}

OPORTUNIDADES DE MEJORA:
• Optimización de la experiencia de usuario específica para ${request.rubro}
• Implementación de elementos de conversión más efectivos
• Mejora en la arquitectura de información y navegación
• Integración de herramientas analíticas avanzadas
• Optimización para motores de búsqueda con enfoque sectorial

PRÓXIMOS PASOS RECOMENDADOS:
Una renovación integral del sitio web, enfocada en las necesidades específicas del sector ${request.rubro}, permitirá aprovechar al máximo el potencial digital de su negocio y mejorar significativamente la experiencia de sus usuarios.

La implementación de las funcionalidades faltantes y las mejoras recomendadas posicionará su sitio web como una herramienta competitiva y efectiva para el crecimiento de su negocio.`;
  }

  private generateFallbackAnalysis(request: CrawlAnalysisRequest): AnalysisResult {
    const expectedFeatures = this.EXPECTED_FEATURES[request.rubro]?.[request.servicio] || [];
    
    return {
      url: request.url,
      title: 'Análisis no disponible',
      description: 'No se pudo acceder al sitio web para realizar el análisis',
      missing_features: expectedFeatures,
      recommendations: [
        'Verificar que el sitio web esté accesible',
        'Implementar funcionalidades específicas del sector',
        'Mejorar la estructura y navegación del sitio',
        'Optimizar para dispositivos móviles',
        'Agregar elementos de confianza y credibilidad'
      ],
      seo_analysis: {
        has_meta_description: false,
        has_meta_keywords: false,
        has_h1_tags: false,
        has_alt_texts: false,
        page_speed_issues: ['No se pudo evaluar la velocidad de carga']
      },
      design_analysis: {
        is_responsive: false,
        has_modern_design: false,
        navigation_issues: ['No se pudo evaluar la navegación'],
        ux_issues: ['No se pudo evaluar la experiencia de usuario']
      },
      content_analysis: {
        content_quality: 'No evaluado',
        missing_sections: ['No se pudo evaluar el contenido'],
        engagement_elements: []
      },
      technical_analysis: {
        has_ssl: false,
        has_contact_forms: false,
        has_social_media: false,
        has_analytics: false
      },
      overall_score: 0,
      detailed_analysis: `ANÁLISIS DEL SITIO WEB: ${request.url}

No fue posible acceder al sitio web para realizar un análisis detallado. Esto puede deberse a:
• El sitio web no está disponible o accesible públicamente
• Problemas de conectividad temporal
• Restricciones de acceso del servidor

RECOMENDACIONES GENERALES PARA ${request.rubro.toUpperCase()} - ${request.servicio.toUpperCase()}:

Basándose en las mejores prácticas para el sector ${request.rubro.toLowerCase()}, se recomienda implementar:

FUNCIONALIDADES ESENCIALES:
${expectedFeatures.map(feature => `• ${feature}`).join('\n')}

ASPECTOS TÉCNICOS FUNDAMENTALES:
• Certificado SSL para seguridad
• Diseño responsive para dispositivos móviles
• Optimización de velocidad de carga
• Implementación de analíticas web
• Formularios de contacto optimizados

CONSIDERACIONES DE UX/UI:
• Navegación intuitiva y clara
• Llamadas a la acción efectivas
• Contenido relevante y de calidad
• Elementos de confianza y credibilidad

Una renovación completa del sitio web, considerando estos aspectos, mejorará significativamente su presencia digital y competitividad en el mercado.`
    };
  }
} 