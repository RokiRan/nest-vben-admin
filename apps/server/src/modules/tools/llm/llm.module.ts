import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LLMService } from './llm.service';
import llmConfig from './llm.config';

@Module({
  imports: [
    ConfigModule.forFeature(llmConfig),
  ],
  providers: [LLMService],
  exports: [LLMService],
})
export class LLMModule {}
