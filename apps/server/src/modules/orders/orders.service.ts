import { Injectable } from '@nestjs/common'
import { LLMService } from '../tools/llm'
import { USER_PROMPTS } from '../tools/llm'

@Injectable()
export class OrdersService {
  constructor(
    private readonly llmService: LLMService,
  ) {}

  async processTicketOCR(file: string) {
    const prompt = USER_PROMPTS.TICKET_OCR()
    const result = await this.llmService.askWithPromptAndFile(prompt, file)
    return result
  }
}