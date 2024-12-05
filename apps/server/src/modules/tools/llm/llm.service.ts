import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private readonly openai: OpenAI;
  private readonly defaultModel: string;
  private readonly defaultTemperature: number;
  private readonly defaultMaxTokens: number;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('llm.openai.apiKey'),
      baseURL: this.configService.get<string>('llm.openai.baseURL'),
    });

    this.defaultModel = this.configService.get<string>('llm.openai.defaultModel');
    this.defaultTemperature = this.configService.get<number>('llm.openai.temperature');
    this.defaultMaxTokens = this.configService.get<number>('llm.openai.maxTokens');
  }

  async chat(
    messages: Array<OpenAI.Chat.ChatCompletionMessageParam>,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {},
  ) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature || this.defaultTemperature,
        max_tokens: options.maxTokens || this.defaultMaxTokens,
      });

      return completion.choices[0].message;
    } catch (error) {
      this.logger.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  async chatWithPrompt(
    prompt: string,
    systemPrompt?: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    return this.chat(messages, options);
  }

  async askWithPromptAndFile(prompt: string, file: string, options?: { model?: string; temperature?: number; maxTokens?: number }) {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];
    // const file_object = await this.openai.files.create({
    //     file: fs.createReadStream(file), 
    //     purpose: FilePurpose.ASSISTANT
    // })
    messages.push({
      role: 'user',
      content: prompt,
    });

    messages.push({
      role: 'user',
      content: `文件内容:${file}`,
    });

    return this.chat(messages, options);
  }
}
