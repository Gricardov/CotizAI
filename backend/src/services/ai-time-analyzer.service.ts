import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AITimeAnalyzerService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // En producción, usar variables de entorno
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');
  }

  async analyzeProjectTime(userTimeDescription: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
Analiza la siguiente descripción de tiempo de desarrollo de un proyecto web y genera una versión profesional y estructurada para una sección de condiciones de contrato.

Descripción del usuario: "${userTimeDescription}"

Genera una respuesta que incluya:
1. Duración estimada en días/meses
2. División en fases o sprints si es aplicable
3. Entregables por fase
4. Consideraciones sobre variaciones de tiempo

Formato de respuesta: Solo el texto estructurado, sin introducciones ni explicaciones adicionales.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analizando tiempo con Gemini:', error);
      
      // Fallback si Gemini falla
      return this.generateFallbackTimeAnalysis(userTimeDescription);
    }
  }

  async generateFallbackTimeAnalysis(userTimeDescription: string): Promise<string> {
    // Análisis básico basado en palabras clave
    const description = userTimeDescription.toLowerCase();
    
    if (description.includes('mes') || description.includes('month')) {
      return 'El proyecto tiene una duración estimada de 3 meses (90 días calendario), divididos en sprints de 2 semanas cada uno. Se entregarán avances cada 15 días con revisiones y ajustes según el feedback del cliente.';
    } else if (description.includes('semana') || description.includes('week')) {
      return 'El proyecto tiene una duración estimada de 8-12 semanas, con entregables semanales y revisiones continuas. Cada fase incluye presentación de avances y ajustes según requerimientos.';
    } else if (description.includes('día') || description.includes('day')) {
      return 'El proyecto tiene una duración estimada de 60-90 días calendario, con entregables quincenales y seguimiento continuo del progreso.';
    } else {
      return 'El proyecto tendrá un tiempo de desarrollo de 3 meses o 90 días calendario, divididos en sprints de 2 semanas cada uno. Se entregarán avances cada 15 días con revisiones y ajustes según el feedback del cliente.';
    }
  }
} 