import { HttpException, Injectable, Logger } from '@nestjs/common';
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

  async askWithPromptAndFile(prompt: string, file: string, options: { model?: string; temperature?: number; maxTokens?: number } = {}) {
    const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [];
    // 存放文件的路径是 /app/public
    const file_path =  process.cwd() + '/public/upload/' + file
    const file_object = await this.openai.files.create({
        file: fs.createReadStream(file_path), 
        // @ts-ignore
        purpose: 'file-extract'
    })
    const file_content = await (await this.openai.files.content(file_object.id)).text()
    messages.push({
      role: 'user',
      content: prompt,
    });

    messages.push({
      role: 'user',
      content: file_content,
    });

    const completion = await this.openai.chat.completions.create({
      model: "moonshot-v1-32k",         
      messages: messages,
      temperature: 0.3,
      ...options,
    });
    this.logger.log('本次消耗的token:', completion.usage.total_tokens)
    this.logger.debug(completion.choices[0].message.content)
    try {
      const result = completion.choices[0].message.content;
      return JSON.parse(result);
    } catch (error) {
      this.logger.error('Error calling OpenAI API:', error);
      throw new Error('Error calling OpenAI API');
    }
  }
}
