import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { RequirePremium } from '../common/require-premium.decorator';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { ParseVoiceDto } from './dto/parse-voice.dto';
import { ParseReceiptDto } from './dto/parse-receipt.dto';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('voice-transaction')
  @RequirePremium('AI_VOICE')
  @UseGuards(RateLimitGuard)
  @ApiOperation({
    summary: 'Parse voice/text input into transaction data via DeepSeek AI',
  })
  async parseVoiceTransaction(
    @Request() req: { user: { id: string } },
    @Body() body: ParseVoiceDto,
  ) {
    return this.aiService.parseVoiceTransaction(
      req.user.id,
      body.text,
      body.language,
    );
  }

  @Post('receipt-transaction')
  @RequirePremium('AI_RECEIPT')
  @UseGuards(RateLimitGuard)
  @ApiOperation({
    summary: 'Parse receipt photo into transaction data via DeepSeek AI Vision',
  })
  async parseReceiptTransaction(
    @Request() req: { user: { id: string } },
    @Body() body: ParseReceiptDto,
  ) {
    return this.aiService.parseReceiptTransaction(
      req.user.id,
      body.imageBase64,
      body.mimeType || 'image/jpeg',
      body.language,
    );
  }
}
