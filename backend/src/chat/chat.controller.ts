import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { RequirePremium } from '../common/require-premium.decorator';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { AppException } from '../common/app-exception';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  @ApiOperation({ summary: 'Get chat history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMessages(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getMessages(
      req.user.id,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('message')
  @RequirePremium('AI_CHAT')
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Send message to AI assistant' })
  async sendMessage(
    @Request() req: { user: { id: string } },
    @Body() body: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      req.user.id,
      body.content,
      body.presetType,
    );
  }

  @Delete('messages')
  @RequirePremium('AI_CHAT')
  @ApiOperation({ summary: 'Clear chat history' })
  async clearMessages(@Request() req: { user: { id: string } }) {
    await this.chatService.clearMessages(req.user.id);
    return { success: true };
  }
}
