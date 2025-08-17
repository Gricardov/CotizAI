import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { WebCrawlerService } from '../services/web-crawler.service';
import { AIWebAnalyzerService } from '../services/ai-web-analyzer.service';
import { AITimeAnalyzerService } from '../services/ai-time-analyzer.service';

interface WebAnalysisRequest {
  url: string;
  rubro: string;
  servicio: string;
  tipo: string;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly webCrawlerService: WebCrawlerService,
    private readonly aiWebAnalyzerService: AIWebAnalyzerService,
    private readonly aiTimeAnalyzerService: AITimeAnalyzerService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
}
