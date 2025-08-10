import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configurar fuentes
pdfMake.vfs = pdfFonts.vfs;

export interface CotizacionData {
  fecha: string;
  nombreEmpresa: string;
  nombreProyecto: string;
  nombreContacto: string;
  correoContacto: string;
  rubro: string;
  servicio: string;
  tipo: string;
  promptsRequerimientos: string;
  requerimientosMejorados: string;
  servicioNecesidad: string;
  descripcionProyecto: string;
  urlAnalisis: string;
  detallePagina: string;
  duracionProyecto: string;
  crmSeleccionado: string;
  crmOtro: string;
  caracteristicas: Array<{ id: string; contenido: string }>;
  itemsPropuesta: Array<{
    id: string;
    descripcion: string;
    monto: number | string;
    descuento: number | string;
    subtotal: number;
    igv: number;
    total: number;
  }>;
  serviciosAdicionales: Array<{
    id: string;
    descripcion: string;
    monto: number | string;
    igv: number;
    total: number;
  }>;
  tiempoAnalizado: string;
}

// Contenido fijo extraído directamente del formulario web
const SECCIONES_FIJAS = {
  procesoUX: [
    "Investigación: Conocimiento de las necesidades del usuario",
    "Evaluación: Evaluaciones heurísticas, benchmarks, pruebas de usabilidad",
    "Arquitectura navegación: Flujo (mapa) de la información",
    "Arquitectura de cada una de las páginas: Wireframes (prototipo navegable)",
    "Presentación"
  ],
  procesoUI: [
    "Diseño de interacción.",
    "Guías de interacción.",
    "Diseño de elementos: botones, documentos, etc.",
    "Diseño visual: iconos, imágenes, ilustraciones.",
    "Guías de estilo: paletas de colores, tipografías.",
    "Diseño de cada una de las páginas: Prototipo navegable web y móvil."
  ],
  procesoSEO: [
    "Análisis, búsqueda y creación de Keywords para posicionamiento web.",
    "Correcto nombramiento de archivos.",
    "Nomenclatura de páginas internas y proyectos.",
    "Detalle de Metatags.",
    "Listado de Inlinks y outlinks."
  ],
  entregables: [
    "Diseño navegable en Figma.",
    "Guía de estilos.",
    "Exportación de elementos visuales en .svg .webp .png .jpg",
    "Informe SEO con listado de palabras, tags, keywords por proyecto."
  ],
  maquetacion: [
    "Implementación del diseño web y mobile en ambiente de desarrollo.",
    "Integración de leads desde todos los formularios a CRM",
    "Implementación y optimización SEO básica para mejorar la visibilidad del sitio web en los motores de búsqueda.",
    "Integración de Google Analytics para el seguimiento y análisis del tráfico web.",
    "Implementación de mapa de calor con Clarity.",
    "QA, pruebas unitarias y performance.",
    "Pase a producción.",
    "Implementación de un sistema de gestión de contenido (CMS) para facilitar la administración y actualización del sitio web."
  ],
  consideraciones: [
    "Deberá proveer la redacción del contenido de la página web.",
    "Deberá proveer un banco de fotos, vídeos e imágenes en alta calidad o en formatos de edición.",
    "Deberá proveer las ilustraciones de personajes, mascotas u otros que se desee incluir en el diseño.",
    "El diseño y desarrollo solo considera el idioma español.",
    "Soporte técnico y mantenimiento básico durante un período inicial de 12 meses después del lanzamiento del sitio web.",
    "El costo final y el tiempo de entrega están sujetos a cambios según los requisitos adicionales del cliente y los ajustes solicitados durante el proceso de desarrollo."
  ],
  noIncluye: [
    "Toma de Fotografía, creación o edición de videos.",
    "Redacción de contenido.",
    "Diseño de Ilustraciones e imágenes."
  ]
};

export class PDFGeneratorService {
  // Función para limpiar asteriscos de textos
  private static cleanAsterisks(text: string): string {
    return text.replace(/\*/g, '');
  }

  // Función para aplicar negrita solo a la parte antes de ":"
  private static formatBoldBeforeColon(text: string): any {
    const colonIndex = text.indexOf(':');
    if (colonIndex === -1) {
      return { text: this.cleanAsterisks(text), style: 'normal' };
    }
    
    const beforeColon = text.substring(0, colonIndex + 1);
    const afterColon = text.substring(colonIndex + 1);
    
    return {
      text: [
        { text: this.cleanAsterisks(beforeColon), style: 'normal', bold: true },
        { text: this.cleanAsterisks(afterColon), style: 'normal' }
      ]
    };
  }

  static async generateCotizacionPDF(data: CotizacionData): Promise<void> {
    // Definir estilos
    const styles = {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 15] as [number, number, number, number],
        lineHeight: 1.4,
        color: '#2c3e50'
      },
      subtitle: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 15] as [number, number, number, number],
        lineHeight: 1.4,
        color: '#667eea'
      },
      normal: {
        fontSize: 12,
        margin: [0, 0, 0, 8] as [number, number, number, number],
        lineHeight: 1.4,
        color: '#495057'
      },
      date: {
        fontSize: 12,
        margin: [0, 0, 0, 30] as [number, number, number, number],
        lineHeight: 1.4,
        color: '#6c757d'
      },
      sectionSpacing: {
        fontSize: 12,
        margin: [0, 0, 0, 25] as [number, number, number, number],
        lineHeight: 1.4,
        color: '#495057'
      },
      listSubtitle: {
        fontSize: 14,
        bold: true,
        margin: [0, 20, 0, 10] as [number, number, number, number],
        lineHeight: 1.4,
        color: '#667eea'
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'white',
        fillColor: '#667eea',
        lineHeight: 1.2
      },
      tableRow: {
        fontSize: 10,
        lineHeight: 1.2,
        color: '#495057'
      },
      bulletList: {
        fontSize: 12,
        margin: [0, 0, 0, 8] as [number, number, number, number],
        lineHeight: 1.2,
        color: '#495057'
      }
    };

    // Función para crear lista con bullets
    const createBulletList = (items: string[]) => {
      return items.map(item => ({
        text: `• ${item}`,
        style: 'bulletList'
      }));
    };

    // Función para crear tabla
    const createTable = (headers: string[], rows: any[]) => {
      return {
        table: {
          headerRows: 1,
          widths: ['70%', '30%'],
          body: [
            headers.map(header => ({ text: header, style: 'tableHeader' })),
            ...rows.map(row => row.map((cell: any) => ({ text: cell.toString(), style: 'tableRow' })))
          ]
        },
        margin: [0, 15, 0, 15] as [number, number, number, number]
      };
    };

    // Construir contenido del documento
    const content: any[] = [];

    // Línea lila al inicio (solo primera página)
    content.push({
      canvas: [
        {
          type: 'line' as const,
          x1: 0, y1: 0, x2: 515, y2: 0,
          lineWidth: 2,
          lineColor: '#663399'
        }
      ],
      margin: [0, 0, 0, 20] as [number, number, number, number]
    });

    // Logo en la esquina superior derecha (solo si existe)
    try {
      const logoBase64 = await this.loadImageAsBase64('/images/logo.png');
      if (logoBase64) {
        content.push({
          absolutePosition: { x: 410, y: 70 }, // Más a la derecha y hacia arriba, pero debajo de la línea
          image: logoBase64,
          width: 150,
          height: 60
        });
      }
    } catch (error) {
      console.warn('Logo no encontrado, continuando sin logo');
    }

    // Fecha con mucho espaciado
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    content.push({ text: `Lima, ${fecha}`, style: 'date' });

    // Saludo
    const nombreEmpresa = data.nombreEmpresa || '[NOMBRE DE LA EMPRESA]';
    content.push({ text: `Señores ${nombreEmpresa}`, style: 'normal', bold: true });
    content.push({ 
      text: 'De nuestra especial consideración:\n\nLuego de extenderle un cordial saludo por medio de la presente, tenemos el agrado de hacerles llegar nuestra propuesta para atender su requerimiento.',
      style: 'sectionSpacing'
    });

    // El proyecto
    if (data.descripcionProyecto) {
      content.push({ text: 'El proyecto', style: 'subtitle' });
      content.push({ text: this.cleanAsterisks(data.descripcionProyecto), style: 'sectionSpacing' });
    }

    // Requerimientos técnicos
    if (data.requerimientosMejorados) {
      content.push({ text: 'Requerimientos técnicos:', style: 'subtitle' });
      
      // Convertir el texto en bullet points
      const requerimientos = this.cleanAsterisks(data.requerimientosMejorados)
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      requerimientos.forEach(requerimiento => {
        content.push({
          text: `• ${requerimiento}`,
          style: 'normal'
        });
      });
      
      content.push({ text: '', margin: [0, 0, 0, 15] as [number, number, number, number] });
    }

    // Principales características (sin card)
    if (data.caracteristicas && data.caracteristicas.length > 0) {
      content.push({ 
        text: 'Principales características a implementar en la web:', 
        style: 'subtitle'
      });
      
      data.caracteristicas.forEach((caracteristica, index) => {
        content.push({
          text: [
            { text: `${index + 1}. `, bold: true, color: '#667eea' },
            { text: this.cleanAsterisks(caracteristica.contenido), color: '#495057' }
          ],
          style: 'normal'
        });
      });
      
      content.push({ text: '', margin: [0, 0, 0, 20] as [number, number, number, number] });
    }

    // Proceso del Diseño UX
    content.push({ 
      text: 'Proceso del Diseño UX:', 
      style: 'listSubtitle'
    });
    content.push(...createBulletList(SECCIONES_FIJAS.procesoUX));

    // Proceso del Diseño UI
    content.push({ 
      text: 'Proceso del Diseño UI:', 
      style: 'listSubtitle'
    });
    content.push(...createBulletList(SECCIONES_FIJAS.procesoUI));

    // Proceso de Análisis SEO
    content.push({ 
      text: 'Proceso de Análisis SEO:', 
      style: 'listSubtitle'
    });
    content.push(...createBulletList(SECCIONES_FIJAS.procesoSEO));

    // Entregables
    content.push({ 
      text: 'Entregables:', 
      style: 'listSubtitle'
    });
    content.push(...createBulletList(SECCIONES_FIJAS.entregables));

    // Maquetación web y mobile
    content.push({ 
      text: 'Maquetación web y mobile:', 
      style: 'listSubtitle'
    });
    content.push(...createBulletList(SECCIONES_FIJAS.maquetacion));

    // Consideraciones
    content.push({ 
      text: 'Consideraciones:', 
      style: 'listSubtitle'
    });
    content.push(...createBulletList(SECCIONES_FIJAS.consideraciones));

    // No incluye
    content.push({ 
      text: 'No incluye:', 
      style: 'listSubtitle'
    });
    content.push(...createBulletList(SECCIONES_FIJAS.noIncluye));

    // Decoración visual entre secciones
    content.push({
      canvas: [
        {
          type: 'line',
          x1: 50, y1: 0, x2: 465, y2: 0,
          lineWidth: 1,
          lineColor: '#e9ecef',
          dash: { length: 5, space: 3 }
        }
      ],
      margin: [0, 20, 0, 20] as [number, number, number, number]
    });

    // Estructura propuesta de la página web
    content.push({ text: 'Estructura propuesta de la página web:', style: 'subtitle' });
    if (data.detallePagina) {
      content.push({ text: this.cleanAsterisks(data.detallePagina), style: 'sectionSpacing' });
    } else {
      content.push({ text: 'No se ha especificado detalle de la página web.', style: 'sectionSpacing' });
    }

    // Integración
    content.push({ text: 'Integración:', style: 'subtitle' });
    let integracionText = '';
    if (data.crmSeleccionado) {
      if (data.crmSeleccionado === 'Otros' && data.crmOtro) {
        integracionText = `${data.crmOtro}`;
      } else {
        integracionText = `${data.crmSeleccionado}`;
      }
    } else {
      integracionText = 'No se ha especificado integración con CRM.';
    }
    content.push({ text: integracionText, style: 'sectionSpacing' });

    // Propuesta Económica
    content.push({ text: 'Propuesta Económica:', style: 'subtitle' });
    if (data.itemsPropuesta && data.itemsPropuesta.length > 0) {
      const headers = ['Descripción', 'Total'];
      const rows = data.itemsPropuesta.map(item => [
        item.descripcion,
        `$${item.total || 0}`
      ]);
      content.push(createTable(headers, rows));
      
      // Total de propuesta económica
      const totalPropuesta = data.itemsPropuesta.reduce((sum, item) => sum + (item.total || 0), 0);
      content.push({ 
        text: `Total Propuesta Económica: $${totalPropuesta.toFixed(2)}`, 
        style: 'normal', 
        bold: true,
        alignment: 'right',
        margin: [0, 10, 0, 20] as [number, number, number, number]
      });
    } else {
      content.push({ text: 'No se han especificado items en la propuesta económica.', style: 'sectionSpacing' });
    }

    // Servicios Adicionales
    content.push({ text: 'Servicios Adicionales:', style: 'subtitle' });
    if (data.serviciosAdicionales && data.serviciosAdicionales.length > 0) {
      const headers = ['Descripción', 'Total'];
      const rows = data.serviciosAdicionales.map(servicio => [
        servicio.descripcion,
        `$${servicio.total || 0}`
      ]);
      content.push(createTable(headers, rows));
      
      // Total de servicios adicionales
      const totalServicios = data.serviciosAdicionales.reduce((sum, servicio) => sum + (servicio.total || 0), 0);
      content.push({ 
        text: `Total Servicios Adicionales: $${totalServicios.toFixed(2)}`, 
        style: 'normal', 
        bold: true,
        alignment: 'right',
        margin: [0, 10, 0, 20] as [number, number, number, number]
      });
    } else {
      content.push({ text: 'No se han especificado servicios adicionales.', style: 'sectionSpacing' });
    }

    // Condiciones
    content.push({ text: 'Condiciones:', style: 'subtitle' });
    
    // Validez de la Cotización
    content.push(this.formatBoldBeforeColon('Validez de la Cotización: 30 días.'));
    
    // Forma de pago
    const formaPago = data.servicio === 'Mejora (solo mostrar el tipo básico)' 
      ? '100% al aceptar la propuesta.' 
      : '50% al aceptar la propuesta y 50% al recibir el acta de conformidad del servicio y su posterior publicación en producción.';
    content.push(this.formatBoldBeforeColon(`Forma de pago: ${formaPago}`));
    
    // Moneda
    content.push(this.formatBoldBeforeColon('Moneda: Dólares Americanos.'));
    
    // Duración del Proyecto
    content.push(this.formatBoldBeforeColon('Duración del Proyecto:'));
    if (data.duracionProyecto) {
      content.push({ text: this.cleanAsterisks(data.duracionProyecto), style: 'normal' });
    }
    
    // Variaciones en el Tiempo de Entrega
    content.push(this.formatBoldBeforeColon('Variaciones en el Tiempo de Entrega:'));
    content.push({ text: this.cleanAsterisks('• Factores Externos: El tiempo estimado para la finalización de cada fase puede variar debido a factores externos fuera de nuestro control, como interrupciones en el servicio de las plataformas, cambios en las regulaciones legales, o eventos de fuerza mayor.'), style: 'normal' });
    content.push({ text: this.cleanAsterisks('• Factores Propios del Cliente: Cualquier retraso en el feedback, la aceptación de entregables o cambios en los requisitos por parte del cliente puede afectar el cronograma establecido. Es esencial que el cliente proporcione respuestas y aprobaciones de manera oportuna para mantener el cronograma previsto.'), style: 'normal' });
    content.push({ text: this.cleanAsterisks('• Revisión y Ajustes: Al finalizar cada sprint, se realizarán revisiones y ajustes necesarios en función del feedback recibido del cliente. Cualquier cambio significativo que requiera un esfuerzo adicional será discutido y presupuestado por separado.'), style: 'normal' });
    
    // Propiedad Intelectual
    content.push(this.formatBoldBeforeColon('Propiedad Intelectual: Todos los derechos de propiedad intelectual desarrollados durante este proyecto serán transferidos al cliente una vez se hayan realizado todos los pagos acordados.'));
    
    // Confidencialidad
    content.push(this.formatBoldBeforeColon('Confidencialidad: Ambas partes acuerdan mantener la confidencialidad de toda la información compartida durante el proyecto.'));
    
    // Garantía
    content.push(this.formatBoldBeforeColon('Garantía: Se garantiza soporte y mantenimiento por un período de 6 meses después del despliegue final.'));

    // Firma
    content.push({ text: '', margin: [0, 0, 0, 30] as [number, number, number, number] });
    
    // Imagen de firma
    try {
      const firmaBase64 = await this.loadImageAsBase64('/images/firma.png');
      if (firmaBase64) {
        content.push({
          image: firmaBase64,
          width: 250,
          height: 100,
          alignment: 'center',
          margin: [0, 0, 0, 10] as [number, number, number, number]
        });
      }
    } catch (error) {
      console.warn('Firma no encontrada, continuando sin firma');
    }
    
    // Línea delgada debajo de la imagen de firma (como contrato)
    content.push({
      canvas: [
        {
          type: 'line' as const,
          x1: 0, y1: 0, x2: 100, y2: 0, // Línea corta centrada
          lineWidth: 1,
          lineColor: '#000000'
        }
      ],
      alignment: 'center',
      margin: [0, 0, 0, 15] as [number, number, number, number]
    });
    
    // Información de la firma
    content.push({ 
      text: 'Juan Jesús Astete Meza', 
      style: 'normal', 
      bold: true, 
      alignment: 'center',
      margin: [0, 0, 0, 5] as [number, number, number, number]
    });
    content.push({ 
      text: 'Cargo: CTO', 
      style: 'normal', 
      alignment: 'center',
      margin: [0, 0, 0, 20] as [number, number, number, number]
    });

    // Definir documento
    const docDefinition = {
      pageSize: 'A4' as const,
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],
      footer: function(currentPage: number, pageCount: number) {
        // Solo mostrar la línea lila en la última página
        if (currentPage === pageCount) {
          return {
            canvas: [
              {
                type: 'line' as const,
                x1: 0, y1: 0, x2: 515, y2: 0,
                lineWidth: 2,
                lineColor: '#663399'
              }
            ],
            margin: [40, 0, 40, 20] as [number, number, number, number]
          };
        }
        return null; // No mostrar nada en otras páginas
      } as any,
      content: content,
      styles: styles,
      defaultStyle: {
        font: 'Roboto'
      }
    };

    // Generar y descargar PDF
    const fileName = `Cotizacion_${data.nombreEmpresa || 'Proyecto'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
  }

  // Función helper para cargar imagen como Base64
  private static async loadImageAsBase64(imagePath: string): Promise<string> {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('No se pudo cargar la imagen:', imagePath);
      return '';
    }
  }
}