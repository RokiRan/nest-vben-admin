import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    // defaultModel: 'gpt-3.5-turbo',
    // temperature: 0.7,
    // maxTokens: 2000,
  },
}));
