import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { WebCrawlerService } from '../services/web-crawler.service';
import { AIWebAnalyzerService } from '../services/ai-web-analyzer.service';
import { AITimeAnalyzerService } from '../services/ai-time-analyzer.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService, WebCrawlerService, AIWebAnalyzerService, AITimeAnalyzerService],
})
export class AppModule {}
