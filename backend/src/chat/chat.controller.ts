import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RateLimitGuard } from '../rate-limit/rate-limit.guard';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  @ApiOperation({ summary: 'Get chat history' })
  async getMessages(@Request() req: any) {
    return this.chatService.getMessages(req.user.id);
  }

  @Post('message')
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  @ApiOperation({ summary: 'Send message to AI assistant' })
  async sendMessage(
    @Request() req: any,
    @Body() body: { content: string; presetType?: string },
  ) {
    if (!body.content?.trim()) {
      return { error: 'Сообщение не может быть пустым' };
    }

    return this.chatService.sendMessage(
      req.user.id,
      body.content.trim(),
      body.presetType,
    );
  }

  @Delete('messages')
  @ApiOperation({ summary: 'Clear chat history' })
  async clearMessages(@Request() req: any) {
    await this.chatService.clearMessages(req.user.id);
    return { success: true };
  }
}