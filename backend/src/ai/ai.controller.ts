import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('voice-transaction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Parse voice/text input into transaction data via DeepSeek AI' })
  async parseVoiceTransaction(
    @Request() req: any,
    @Body() body: { text: string; language?: string },
  ) {
    if (!body.text || !body.text.trim()) {
      return { error: 'Текст не может быть пустым' };
    }

    const result = await this.aiService.parseVoiceTransaction(
      req.user.id,
      body.text.trim(),
      body.language,
    );

    return result;
  }

  @Post('receipt-transaction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Parse receipt photo into transaction data via DeepSeek AI Vision' })
  async parseReceiptTransaction(
    @Request() req: any,
    @Body() body: { imageBase64: string; mimeType: string; language?: string },
  ) {
    if (!body.imageBase64) {
      return { error: 'Изображение не предоставлено' };
    }

    if (!body.mimeType) {
      body.mimeType = 'image/jpeg';
    }

    const result = await this.aiService.parseReceiptTransaction(
      req.user.id,
      body.imageBase64,
      body.mimeType,
      body.language,
    );

    return result;
  }
}