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

    // ENCABEZADO LLAMATIVO EN COLOR LILA
    pdf.setFillColor(102, 51, 153); // Color lila
    pdf.rect(0, 0, pageWidth, 3, 'F'); // Línea muy delgada
    
    // Restaurar colores y posición
    pdf.setTextColor(0, 0, 0);
    yPosition = 20; // Empezar después de la línea delgada

    // FECHA EN LIMA
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    pdf.setFontSize(12); // Letras más pequeñas
    pdf.setFont('helvetica', 'normal'); // Sin negrita
    pdf.text(`Lima, ${fecha}`, margin, yPosition);
    yPosition += 15;
    
    // Separar el saludo para aplicar negrita solo a "Señores (nombre de la empresa)"
    const nombreEmpresa = data.nombreEmpresa || '[NOMBRE DE LA EMPRESA]';
    
    // Primera línea con negrita
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Señores ${nombreEmpresa}`, margin, yPosition);
    yPosition += 5;
    
    // Resto del texto sin negrita
    pdf.setFont('helvetica', 'normal');
    const restoSaludo = `De nuestra especial consideración:\n\nLuego de extenderle un cordial saludo por medio de la presente, tenemos el agrado de hacerles llegar nuestra propuesta para atender su requerimiento.`;
    
    const restoSaludoHeight = addWrappedText(restoSaludo, margin, yPosition, contentWidth);
    yPosition += restoSaludoHeight + 15;

    // EL PROYECTO
    if (data.descripcionProyecto) {
      yPosition = addSubtitle('El proyecto', yPosition); // Primera letra mayúscula, resto minúscula
      yPosition += 5;
      
      // Descripción sin negrita
      pdf.setFont('helvetica', 'normal');
      const descripcionHeight = addWrappedText(data.descripcionProyecto, margin, yPosition, contentWidth);
      yPosition += descripcionHeight + 15;
    }

    // NUEVA SECCIÓN: CARD MODERNA CON CARACTERÍSTICAS Y PROCESOS
    // Empezar inmediatamente después de "El proyecto"
    
    // Variables para controlar la card
    let cardStartY = yPosition;
    let cardEndY = yPosition;
    
    // Función para calcular altura del contenido que cabe en la página actual
    const calculateContentHeight = (startY: number, endY: number) => {
      return endY - startY + 10; // +10 para padding
    };
    
    // Función para dibujar card con altura calculada
    const drawCard = (startY: number, height: number) => {
      // Solo borde, sin relleno (fondo transparente)
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(margin - 5, startY - 5, contentWidth + 10, height, 3, 3, 'S'); // Solo stroke, sin fill
    };
    
    // PRINCIPALES CARACTERÍSTICAS A IMPLEMENTAR
    if (data.caracteristicas && data.caracteristicas.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Principales características a implementar en la web:', margin, yPosition + 10); // +10 para padding interno
      yPosition += 18; // Más espacio después del título
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      data.caracteristicas.forEach((caracteristica, index) => {
        // Verificar si necesitamos nueva página
        if (yPosition + 20 > pageHeight - margin) {
          // Calcular altura de la card en esta página
          cardEndY = yPosition;
          const cardHeight = calculateContentHeight(cardStartY, cardEndY);
          
          // Dibujar la card con altura calculada
          drawCard(cardStartY, cardHeight);
          
          // Nueva página
          pdf.addPage();
          yPosition = margin;
          cardStartY = yPosition;
        }
        
        const caracteristicaText = `${index + 1}. ${caracteristica.contenido}`;
        const caracteristicaHeight = addWrappedText(caracteristicaText, margin + 5, yPosition, contentWidth - 10);
        yPosition += caracteristicaHeight + 3;
      });
      
      yPosition += 10;
    }
    
    // PROCESO DEL DISEÑO UX
    if (yPosition + 20 > pageHeight - margin) {
      // Calcular altura de la card en esta página
      cardEndY = yPosition;
      const cardHeight = calculateContentHeight(cardStartY, cardEndY);
      
      // Dibujar la card con altura calculada
      drawCard(cardStartY, cardHeight);
      
      // Nueva página
      pdf.addPage();
      yPosition = margin;
      cardStartY = yPosition;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Proceso del Diseño UX:', margin, yPosition + 5); // +5 para padding interno
    yPosition += 13; // Más espacio después del título
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const procesoUX = `Análisis de usuarios y objetivos del negocio. Investigación de competencia y mejores prácticas. Creación de user personas y user journey maps. Wireframing y prototipado de baja fidelidad. Testing de usabilidad y iteración basada en feedback.`;
    const procesoUXHeight = addWrappedText(procesoUX, margin + 5, yPosition, contentWidth - 10);
    yPosition += procesoUXHeight + 10;
    
    // PROCESO DEL DISEÑO UI
    if (yPosition + 20 > pageHeight - margin) {
      // Calcular altura de la card en esta página
      cardEndY = yPosition;
      const cardHeight = calculateContentHeight(cardStartY, cardEndY);
      
      // Dibujar la card con altura calculada
      drawCard(cardStartY, cardHeight);
      
      // Nueva página
      pdf.addPage();
      yPosition = margin;
      cardStartY = yPosition;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Proceso del Diseño UI:', margin, yPosition + 5); // +5 para padding interno
    yPosition += 13; // Más espacio después del título
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const procesoUI = `Definición del sistema de diseño y guía de estilos. Creación de moodboards y paletas de colores. Diseño de componentes y elementos de interfaz. Maquetación de pantallas en alta fidelidad. Implementación de micro-interacciones y animaciones.`;
    const procesoUIHeight = addWrappedText(procesoUI, margin + 5, yPosition, contentWidth - 10);
    yPosition += procesoUIHeight + 10;
    
    // PROCESO DE ANÁLISIS SEO
    if (yPosition + 20 > pageHeight - margin) {
      // Calcular altura de la card en esta página
      cardEndY = yPosition;
      const cardHeight = calculateContentHeight(cardStartY, cardEndY);
      
      // Dibujar la card con altura calculada
      drawCard(cardStartY, cardHeight);
      
      // Nueva página
      pdf.addPage();
      yPosition = margin;
      cardStartY = yPosition;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Proceso de Análisis SEO:', margin, yPosition + 5); // +5 para padding interno
    yPosition += 13; // Más espacio después del título
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const procesoSEO = `Investigación de palabras clave relevantes para el sector. Análisis de la competencia y oportunidades de posicionamiento. Optimización on-page de títulos, meta descripciones y contenido. Implementación de estructura de datos y schema markup. Configuración de herramientas de análisis y seguimiento.`;
    const procesoSEOHeight = addWrappedText(procesoSEO, margin + 5, yPosition, contentWidth - 10);
    yPosition += procesoSEOHeight + 10;
    
    // ENTREGABLES
    if (yPosition + 20 > pageHeight - margin) {
      // Calcular altura de la card en esta página
      cardEndY = yPosition;
      const cardHeight = calculateContentHeight(cardStartY, cardEndY);
      
      // Dibujar la card con altura calculada
      drawCard(cardStartY, cardHeight);
      
      // Nueva página
      pdf.addPage();
      yPosition = margin;
      cardStartY = yPosition;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Entregables:', margin, yPosition + 5); // +5 para padding interno
    yPosition += 13; // Más espacio después del título
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const entregables = `Sitio web completamente funcional y responsive. Panel de administración para gestión de contenido. Documentación técnica del proyecto. Manual de usuario para el cliente. Certificado SSL y optimización de rendimiento.`;
    const entregablesHeight = addWrappedText(entregables, margin + 5, yPosition, contentWidth - 10);
    yPosition += entregablesHeight + 10;
    
    // MAQUETACIÓN WEB Y MOBILE
    if (yPosition + 20 > pageHeight - margin) {
      // Calcular altura de la card en esta página
      cardEndY = yPosition;
      const cardHeight = calculateContentHeight(cardStartY, cardEndY);
      
      // Dibujar la card con altura calculada
      drawCard(cardStartY, cardHeight);
      
      // Nueva página
      pdf.addPage();
      yPosition = margin;
      cardStartY = yPosition;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Maquetación web y mobile:', margin, yPosition + 5); // +5 para padding interno
    yPosition += 13; // Más espacio después del título
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const maquetacion = `Desarrollo responsive que se adapta a todos los dispositivos. Optimización para móviles con diseño mobile-first. Implementación de técnicas de lazy loading y optimización de imágenes. Testing en múltiples navegadores y dispositivos.`;
    const maquetacionHeight = addWrappedText(maquetacion, margin + 5, yPosition, contentWidth - 10);
    yPosition += maquetacionHeight + 10;
    
    // CONSIDERACIONES
    if (yPosition + 20 > pageHeight - margin) {
      // Calcular altura de la card en esta página
      cardEndY = yPosition;
      const cardHeight = calculateContentHeight(cardStartY, cardEndY);
      
      // Dibujar la card con altura calculada
      drawCard(cardStartY, cardHeight);
      
      // Nueva página
      pdf.addPage();
      yPosition = margin;
      cardStartY = yPosition;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Consideraciones:', margin, yPosition + 5); // +5 para padding interno
    yPosition += 13; // Más espacio después del título
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const consideraciones = `El proyecto incluye hasta 3 revisiones de diseño. Los cambios mayores después de la aprobación final pueden generar costos adicionales. Se incluye capacitación básica para el uso del panel de administración.`;
    const consideracionesHeight = addWrappedText(consideraciones, margin + 5, yPosition, contentWidth - 10);
    yPosition += consideracionesHeight + 10;
    
    // NO INCLUYE
    if (yPosition + 20 > pageHeight - margin) {
      // Calcular altura de la card en esta página
      cardEndY = yPosition;
      const cardHeight = calculateContentHeight(cardStartY, cardEndY);
      
      // Dibujar la card con altura calculada
      drawCard(cardStartY, cardHeight);
      
      // Nueva página
      pdf.addPage();
      yPosition = margin;
      cardStartY = yPosition;
    }
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('No incluye:', margin, yPosition + 5); // +5 para padding interno
    yPosition += 13; // Más espacio después del título
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const noIncluye = `Hosting y dominio (se pueden gestionar por separado). Contenido fotográfico profesional (se pueden sugerir bancos de imágenes). Integración con sistemas externos complejos (se cotizan por separado). Mantenimiento posterior al lanzamiento (se puede contratar como servicio adicional).`;
    const noIncluyeHeight = addWrappedText(noIncluye, margin + 5, yPosition, contentWidth - 10);
    yPosition += noIncluyeHeight + 15;
    
    // Dibujar la card final con altura calculada
    cardEndY = yPosition;
    const finalCardHeight = calculateContentHeight(cardStartY, cardEndY);
    drawCard(cardStartY, finalCardHeight);
    
    // ESTRUCTURA PROPUESTA DE LA PÁGINA WEB
    yPosition += 20;
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Estructura propuesta de la página web:', margin, yPosition);
    yPosition += 10;
    
    if (data.detallePagina) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const estructuraHeight = addWrappedText(data.detallePagina, margin, yPosition, contentWidth);
      yPosition += estructuraHeight + 15;
    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No se ha especificado detalle de la página web.', margin, yPosition);
      yPosition += 15;
    }
    
    // INTEGRACIÓN
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Integración:', margin, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    let integracionText = '';
    if (data.crmSeleccionado) {
      integracionText += `CRM seleccionado: ${data.crmSeleccionado}`;
      if (data.crmSeleccionado === 'Otros' && data.crmOtro) {
        integracionText += ` - ${data.crmOtro}`;
      }
    } else {
      integracionText = 'No se ha especificado integración con CRM.';
    }
    
    const integracionHeight = addWrappedText(integracionText, margin, yPosition, contentWidth);
    yPosition += integracionHeight + 15;
    
    // PROPUESTA ECONÓMICA
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Propuesta Económica:', margin, yPosition);
    yPosition += 15;
    
    // Función para dibujar tabla moderna con paginación
    const drawModernTable = (headers: string[], rows: any[], startY: number) => {
      const tableWidth = contentWidth;
      const colWidths = [tableWidth * 0.7, tableWidth * 0.3]; // Solo 2 columnas: Descripción y Total
      const rowHeight = 12;
      const headerHeight = 15;
      let currentY = startY;
      
      // Dibujar encabezado
      pdf.setFillColor(102, 51, 153); // Color lila
      pdf.setDrawColor(102, 51, 153);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, currentY, tableWidth, headerHeight, 'F');
      
      // Texto del encabezado
      pdf.setFontSize(10); // Tamaño más pequeño
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255); // Texto blanco
      
      let xPos = margin;
      headers.forEach((header, index) => {
        pdf.text(header, xPos + 2, currentY + 10);
        xPos += colWidths[index];
      });
      
      // Restaurar colores
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      currentY += headerHeight;
      
      // Dibujar filas con paginación
      rows.forEach((row, rowIndex) => {
        // Verificar si necesitamos nueva página
        if (currentY + rowHeight > pageHeight - margin) {
          // Nueva página
          pdf.addPage();
          currentY = margin;
          
          // Redibujar encabezado en la nueva página
          pdf.setFillColor(102, 51, 153);
          pdf.setDrawColor(102, 51, 153);
          pdf.setLineWidth(0.5);
          pdf.rect(margin, currentY, tableWidth, headerHeight, 'F');
          
          // Texto del encabezado
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(255, 255, 255);
          
          xPos = margin;
          headers.forEach((header, index) => {
            pdf.text(header, xPos + 2, currentY + 10);
            xPos += colWidths[index];
          });
          
          pdf.setTextColor(0, 0, 0);
          pdf.setFont('helvetica', 'normal');
          
          currentY += headerHeight;
        }
        
        // Fondo alternado
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(248, 249, 250);
          pdf.rect(margin, currentY, tableWidth, rowHeight, 'F');
        }
        
        // Bordes de la fila
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.2);
        pdf.rect(margin, currentY, tableWidth, rowHeight, 'S');
        
        // Contenido de la fila
        pdf.setFontSize(10);
        xPos = margin;
        row.forEach((cell: any, cellIndex: number) => {
          pdf.text(cell.toString(), xPos + 2, currentY + 8);
          xPos += colWidths[cellIndex];
        });
        
        currentY += rowHeight;
      });
      
      return currentY;
    };
    
    // Tabla de Propuesta Económica
    if (data.itemsPropuesta && data.itemsPropuesta.length > 0) {
      const headers = ['Descripción', 'Total'];
      const rows = data.itemsPropuesta.map(item => [
        item.descripcion,
        `$${item.total || 0}`
      ]);
      
      yPosition = drawModernTable(headers, rows, yPosition);
      yPosition += 20;
    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No se han especificado items en la propuesta económica.', margin, yPosition);
      yPosition += 20;
    }
    
    // SERVICIOS ADICIONALES
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Servicios Adicionales:', margin, yPosition);
    yPosition += 15;
    
    // Tabla de Servicios Adicionales
    if (data.serviciosAdicionales && data.serviciosAdicionales.length > 0) {
      const headers = ['Descripción', 'Total'];
      const rows = data.serviciosAdicionales.map(servicio => [
        servicio.descripcion,
        `$${servicio.total || 0}`
      ]);
      
      yPosition = drawModernTable(headers, rows, yPosition);
      yPosition += 20;
    } else {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('No se han especificado servicios adicionales.', margin, yPosition);
      yPosition += 20;
    }
    
    // CONDICIONES
    if (yPosition + 20 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Condiciones:', margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    // Condiciones fijas
    const condiciones = [
      '• El proyecto incluye hasta 3 revisiones de diseño.',
      '• Los cambios mayores después de la aprobación final pueden generar costos adicionales.',
      '• Se incluye capacitación básica para el uso del panel de administración.',
      '• El pago se realizará en las siguientes cuotas:',
      '  - 50% al inicio del proyecto',
      '  - 30% al completar el diseño y maquetación',
      '  - 20% al finalizar el desarrollo y entregar el proyecto'
    ];
    
    // Si el servicio es "Mejora", añadir condiciones especiales
    if (data.servicio === 'Mejora') {
      condiciones.push('• Condiciones especiales para servicio de Mejora:');
      condiciones.push('  - Pago único al finalizar el proyecto');
      condiciones.push('  - Incluye hasta 2 revisiones menores');
    }
    
    // Duración del proyecto si está especificada
    if (data.duracionProyecto) {
      condiciones.push(`• Duración del Proyecto: ${data.duracionProyecto}`);
    }
    
    condiciones.forEach(condicion => {
      if (yPosition + 15 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      const condicionHeight = addWrappedText(condicion, margin, yPosition, contentWidth);
      yPosition += condicionHeight + 5;
    });
    
    yPosition += 15;
    
    // Generar y descargar el PDF
    const fileName = `Cotizacion_${data.nombreEmpresa || 'Proyecto'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }
}