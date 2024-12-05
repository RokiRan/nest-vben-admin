export interface LLMConfig {
  openai: {
    apiKey: string;
    baseURL: string;
    defaultModel: string;
    temperature: number;
    maxTokens: number;
  };
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
