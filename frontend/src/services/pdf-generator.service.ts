import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  servicioNecesidad: string;
  descripcionProyecto: string;
  urlAnalisis: string;
  detallePagina: string;
  tiempoDesarrollo: string;
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

export class PDFGeneratorService {
  static async generateCotizacionPDF(data: CotizacionData): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Configurar fuente
    pdf.setFont('helvetica');
    pdf.setFontSize(12);

    // Función para agregar texto con wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return lines.length * (fontSize * 0.4); // Altura aproximada
    };

    // Función para agregar título
    const addTitle = (text: string, y: number) => {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(text, margin, y);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      return y + 8;
    };

    // Función para agregar subtítulo
    const addSubtitle = (text: string, y: number) => {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(text, margin, y);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      return y + 6;
    };

    // Función para verificar si necesitamos nueva página
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Encabezado con fecha y ciudad
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    yPosition = addTitle(`Lima, ${fecha}`, yPosition);
    yPosition += 10;

    // Saludo y presentación
    const saludo = `Señores ${data.nombreEmpresa || '[NOMBRE DE LA EMPRESA]'}\nDe nuestra especial consideración:\n\nLuego de extenderle un cordial saludo por medio de la presente, tenemos el agrado de hacerles llegar nuestra propuesta para atender su requerimiento.`;
    
    const saludoHeight = addWrappedText(saludo, margin, yPosition, contentWidth);
    yPosition += saludoHeight + 10;

    // Datos de la empresa
    yPosition = addSubtitle('DATOS DE LA EMPRESA', yPosition);
    yPosition += 5;

    const datosEmpresa = [
      `Razón Social: Alavista Lab SAC`,
      `RUC: 20607124711`,
      `Dirección: Av. Benavides 2975, Oficina 809, Miraflores`,
      `Contacto: Juan Jesús Astete Meza`,
      `Teléfono: 959271576`
    ];

    datosEmpresa.forEach(dato => {
      pdf.text(dato, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Información del proyecto
    yPosition = addSubtitle('INFORMACIÓN DEL PROYECTO', yPosition);
    yPosition += 5;

    const infoProyecto = [
      `Fecha: ${data.fecha || 'Por definir'}`,
      `Nombre de empresa: ${data.nombreEmpresa || 'Por definir'}`,
      `Nombre del proyecto: ${data.nombreProyecto || 'Por definir'}`,
      `Rubro: ${data.rubro || 'Por definir'}`,
      `Servicio: ${data.servicio || 'Por definir'}`,
      `Tipo: ${data.tipo || 'Por definir'}`,
      `Nombre del contacto: ${data.nombreContacto || 'Por definir'}`,
      `Correo de contacto: ${data.correoContacto || 'Por definir'}`
    ];

    infoProyecto.forEach(info => {
      pdf.text(info, margin, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Servicio (Necesidad)
    if (data.servicioNecesidad) {
      checkNewPage(30);
      yPosition = addSubtitle('SERVICIO (NECESIDAD)', yPosition);
      yPosition += 5;
      
      const servicioHeight = addWrappedText(data.servicioNecesidad, margin, yPosition, contentWidth);
      yPosition += servicioHeight + 10;
    }

    // Descripción del proyecto
    if (data.descripcionProyecto) {
      checkNewPage(30);
      yPosition = addSubtitle('DESCRIPCIÓN DEL PROYECTO', yPosition);
      yPosition += 5;
      
      const descripcionHeight = addWrappedText(data.descripcionProyecto, margin, yPosition, contentWidth);
      yPosition += descripcionHeight + 10;
    }

    // Prompts de requerimientos técnicos (si es tipo Básico)
    if (data.tipo === 'Básico' && data.promptsRequerimientos) {
      checkNewPage(30);
      yPosition = addSubtitle('PROMPTS DE REQUERIMIENTOS TÉCNICOS', yPosition);
      yPosition += 5;
      
      const promptsHeight = addWrappedText(data.promptsRequerimientos, margin, yPosition, contentWidth);
      yPosition += promptsHeight + 10;
    }

    // Características principales
    if (data.caracteristicas && data.caracteristicas.length > 0) {
      checkNewPage(50);
      yPosition = addSubtitle('PRINCIPALES CARACTERÍSTICAS A IMPLEMENTAR', yPosition);
      yPosition += 5;

      data.caracteristicas.forEach((caracteristica, index) => {
        checkNewPage(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Característica ${index + 1}:`, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        yPosition += 5;
        
        const caracteristicaHeight = addWrappedText(caracteristica.contenido, margin, yPosition, contentWidth);
        yPosition += caracteristicaHeight + 8;
      });
    }

    // Secciones fijas
    const seccionesFijas = [
      {
        titulo: 'PROCESO DEL DISEÑO',
        contenido: [
          'Investigación: Conocimiento de las necesidades del usuario',
          'Evaluación: Evaluaciones heurísticas, benchmarks, pruebas de usabilidad',
          'Arquitectura navegación: Flujo (mapa) de la información',
          'Arquitectura de cada una de las páginas: Wireframes (prototipo navegable)',
          'Presentación'
        ]
      },
      {
        titulo: 'PROCESO DEL DISEÑO UI',
        contenido: [
          'Diseño de interacción.',
          'Guías de interacción.',
          'Diseño de elementos: botones, documentos, etc.',
          'Diseño visual: iconos, imágenes, ilustraciones.',
          'Guías de estilo: paletas de colores, tipografías.',
          'Diseño de cada una de las páginas: Prototipo navegable web y móvil.'
        ]
      },
      {
        titulo: 'PROCESO DE ANÁLISIS SEO',
        contenido: [
          'Análisis, búsqueda y creación de Keywords para posicionamiento web.',
          'Correcto nombramiento de archivos.',
          'Nomenclatura de páginas internas y proyectos.',
          'Detalle de Metatags.',
          'Listado de Inlinks y outlinks.'
        ]
      },
      {
        titulo: 'ENTREGABLES',
        contenido: [
          'Diseño navegable en Figma.',
          'Guía de estilos.',
          'Exportación de elementos visuales en .svg .webp .png .jpg',
          'Informe SEO con listado de palabras, tags, keywords por proyecto.'
        ]
      },
      {
        titulo: 'MAQUETACIÓN WEB Y MOBILE',
        contenido: [
          'Implementación del diseño web y mobile en ambiente de desarrollo.',
          'Integración de leads desde todos los formularios a CRM',
          'Implementación y optimización SEO básica para mejorar la visibilidad del sitio web en los motores de búsqueda.',
          'Integración de Google Analytics para el seguimiento y análisis del tráfico web.',
          'Implementación de mapa de calor con Clarity.',
          'QA, pruebas unitarias y performance.',
          'Pase a producción.',
          'Implementación de un sistema de gestión de contenido (CMS) para facilitar la administración y actualización del sitio web.'
        ]
      }
    ];

    seccionesFijas.forEach(seccion => {
      checkNewPage(50);
      yPosition = addSubtitle(seccion.titulo, yPosition);
      yPosition += 5;

      seccion.contenido.forEach(item => {
        checkNewPage(8);
        pdf.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    });

    // Consideraciones y No incluye
    checkNewPage(40);
    yPosition = addSubtitle('CONSIDERACIONES', yPosition);
    yPosition += 5;

    const consideraciones = [
      'Deberá proveer la redacción del contenido de la página web.',
      'Deberá proveer un banco de fotos, vídeos e imágenes en alta calidad o en formatos de edición.',
      'Deberá proveer las ilustraciones de personajes, mascotas u otros que se desee incluir en el diseño.',
      'El diseño y desarrollo solo considera el idioma español.',
      'Soporte técnico y mantenimiento básico durante un período inicial de 12 meses después del lanzamiento del sitio web.',
      'El costo final y el tiempo de entrega están sujetos a cambios según los requisitos adicionales del cliente y los ajustes solicitados durante el proceso de desarrollo.'
    ];

    consideraciones.forEach(item => {
      checkNewPage(8);
      pdf.text(`• ${item}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 5;

    checkNewPage(20);
    yPosition = addSubtitle('NO INCLUYE', yPosition);
    yPosition += 5;

    const noIncluye = [
      'Toma de Fotografía, creación o edición de videos.',
      'Redacción de contenido.',
      'Diseño de Ilustraciones e imágenes.'
    ];

    noIncluye.forEach(item => {
      pdf.text(`• ${item}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Estructura propuesta del sitio web
    if (data.detallePagina) {
      checkNewPage(50);
      yPosition = addSubtitle('ESTRUCTURA PROPUESTA DEL SITIO WEB', yPosition);
      yPosition += 5;
      
      const estructuraHeight = addWrappedText(data.detallePagina, margin, yPosition, contentWidth);
      yPosition += estructuraHeight + 10;
    }

    // Integración
    checkNewPage(30);
    yPosition = addSubtitle('INTEGRACIÓN', yPosition);
    yPosition += 5;

    const integracion = [
      'Integración de leads e inventario de unidades por proyecto.',
      'Pruebas de integración con proveedor.',
      `Integración: Mediante API a CRM ${data.crmSeleccionado}${data.crmSeleccionado === 'Otros' ? ` - ${data.crmOtro}` : ''}`
    ];

    integracion.forEach(item => {
      pdf.text(`• ${item}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 10;

    // Tiempo de desarrollo
    checkNewPage(20);
    yPosition = addSubtitle('TIEMPO DE DESARROLLO', yPosition);
    yPosition += 5;
    
    const tiempoHeight = addWrappedText(data.tiempoAnalizado || data.tiempoDesarrollo, margin, yPosition, contentWidth);
    yPosition += tiempoHeight + 10;

    // Propuesta económica
    checkNewPage(100);
    yPosition = addSubtitle('PROPUESTA ECONÓMICA', yPosition);
    yPosition += 10;

    // Tabla principal
    yPosition = addSubtitle('Diseño y desarrollo de página web Inmobiliaria', yPosition);
    yPosition += 5;

    // Encabezados de tabla
    const tableHeaders = ['Descripción', 'Monto ($)', 'Descuento', 'Subtotal', 'IGV (18%)', 'Total'];
    const columnWidths = [60, 25, 25, 25, 25, 25];
    let xPosition = margin;

    pdf.setFont('helvetica', 'bold');
    tableHeaders.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    yPosition += 8;
    pdf.setFont('helvetica', 'normal');

    // Filas de la tabla
    data.itemsPropuesta.forEach(item => {
      checkNewPage(10);
      xPosition = margin;
      
      pdf.text(item.descripcion.substring(0, 30) + (item.descripcion.length > 30 ? '...' : ''), xPosition, yPosition);
      xPosition += columnWidths[0];
      
      pdf.text(`$ ${typeof item.monto === 'string' ? item.monto : item.monto.toFixed(2)}`, xPosition, yPosition);
      xPosition += columnWidths[1];
      
      pdf.text(`$ ${typeof item.descuento === 'string' ? item.descuento : item.descuento.toFixed(2)}`, xPosition, yPosition);
      xPosition += columnWidths[2];
      
      pdf.text(`$ ${item.subtotal.toFixed(2)}`, xPosition, yPosition);
      xPosition += columnWidths[3];
      
      pdf.text(`$ ${item.igv.toFixed(2)}`, xPosition, yPosition);
      xPosition += columnWidths[4];
      
      pdf.text(`$ ${item.total.toFixed(2)}`, xPosition, yPosition);
      
      yPosition += 6;
    });

    // Total propuesta
    const totalPropuesta = data.itemsPropuesta.reduce((sum, item) => sum + item.total, 0);
    yPosition += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total: $ ${totalPropuesta.toFixed(2)}`, margin + 150, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition += 15;

    // Servicios adicionales
    if (data.serviciosAdicionales && data.serviciosAdicionales.length > 0) {
      checkNewPage(50);
      yPosition = addSubtitle('Servicios adicionales', yPosition);
      yPosition += 5;

      const serviciosHeaders = ['Descripción', 'Monto ($)', 'IGV (18%)', 'Total'];
      const serviciosColumnWidths = [80, 30, 30, 30];
      xPosition = margin;

      pdf.setFont('helvetica', 'bold');
      serviciosHeaders.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += serviciosColumnWidths[index];
      });
      yPosition += 8;
      pdf.setFont('helvetica', 'normal');

      data.serviciosAdicionales.forEach(servicio => {
        checkNewPage(10);
        xPosition = margin;
        
        pdf.text(servicio.descripcion.substring(0, 40) + (servicio.descripcion.length > 40 ? '...' : ''), xPosition, yPosition);
        xPosition += serviciosColumnWidths[0];
        
        pdf.text(`$ ${typeof servicio.monto === 'string' ? servicio.monto : servicio.monto.toFixed(2)}`, xPosition, yPosition);
        xPosition += serviciosColumnWidths[1];
        
        pdf.text(`$ ${servicio.igv.toFixed(2)}`, xPosition, yPosition);
        xPosition += serviciosColumnWidths[2];
        
        pdf.text(`$ ${servicio.total.toFixed(2)}`, xPosition, yPosition);
        
        yPosition += 6;
      });

      // Total servicios adicionales
      const totalServicios = data.serviciosAdicionales.reduce((sum, servicio) => sum + servicio.total, 0);
      yPosition += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Total: $ ${totalServicios.toFixed(2)}`, margin + 150, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition += 15;
    }

    // Total general
    const granTotal = totalPropuesta + (data.serviciosAdicionales?.reduce((sum, servicio) => sum + servicio.total, 0) || 0);
    checkNewPage(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('TOTAL GENERAL', margin, yPosition);
    pdf.text(`$ ${granTotal.toFixed(2)}`, margin + 150, yPosition);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    yPosition += 20;

    // Condiciones
    checkNewPage(100);
    yPosition = addSubtitle('CONDICIONES', yPosition);
    yPosition += 5;

    const condiciones = [
      'Validez de la Cotización: 30 días.',
      `Forma de pago: ${data.servicio === 'Mejora (solo mostrar el tipo básico)' ? '100% al aceptar la propuesta.' : '50% al aceptar la propuesta y 50% al recibir el acta de conformidad del servicio y su posterior publicación en producción.'}`,
      'Moneda: Dólares Americanos.',
      `Duración del Proyecto: ${data.tiempoAnalizado || 'El proyecto tiene una duración estimada de 3 meses (90 días calendario), divididos en sprints de 2 semanas cada uno. Se entregarán avances cada 15 días con revisiones y ajustes según el feedback del cliente.'}`,
      'Variaciones en el Tiempo de Entrega:',
      '  • Factores Externos: El tiempo estimado para la finalización de cada fase puede variar debido a factores externos fuera de nuestro control, como interrupciones en el servicio de las plataformas, cambios en las regulaciones legales, o eventos de fuerza mayor.',
      '  • Factores Propios del Cliente: Cualquier retraso en el feedback, la aceptación de entregables o cambios en los requisitos por parte del cliente puede afectar el cronograma establecido. Es esencial que el cliente proporcione respuestas y aprobaciones de manera oportuna para mantener el cronograma previsto.',
      '  • Revisión y Ajustes: Al finalizar cada sprint, se realizarán revisiones y ajustes necesarios en función del feedback recibido del cliente. Cualquier cambio significativo que requiera un esfuerzo adicional será discutido y presupuestado por separado.',
      'Propiedad Intelectual: Todos los derechos de propiedad intelectual desarrollados durante este proyecto serán transferidos al cliente una vez se hayan realizado todos los pagos acordados.',
      'Confidencialidad: Ambas partes acuerdan mantener la confidencialidad de toda la información compartida durante el proyecto.',
      'Garantía: Se garantiza soporte y mantenimiento por un período de 6 meses después del despliegue final.'
    ];

    condiciones.forEach(condicion => {
      checkNewPage(8);
      if (condicion.startsWith('  •')) {
        pdf.text(condicion, margin + 5, yPosition);
      } else {
        pdf.text(condicion, margin, yPosition);
      }
      yPosition += 5;
    });

    // Firma
    checkNewPage(30);
    yPosition += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.text('FIRMA:', margin, yPosition);
    yPosition += 15;
    pdf.text('Juan Jesús Astete Meza', margin, yPosition);
    yPosition += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Cargo: CTO', margin, yPosition);

    // Generar y descargar el PDF
    const fileName = `Cotizacion_${data.nombreEmpresa || 'Proyecto'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }
} 