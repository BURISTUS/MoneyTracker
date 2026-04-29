import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
  @ApiOperation({ summary: 'Send message to AI assistant' })
  async sendMessage(
    @Request() req: any,
    @Body() body: { content: string; presetType?: string },
  ) {
    // Save user message
    const userMessage = await this.chatService.createMessage({
      userId: req.user.id,
      role: 'USER',
      content: body.content,
      presetType: body.presetType as any,
    });

    // TODO: Call DeepSeek API here
    // For now, return mock response
    const assistantContent = await this.chatService.getMockResponse(body.presetType, req.user.id);

    // Save assistant response
    const assistantMessage = await this.chatService.createMessage({
      userId: req.user.id,
      role: 'ASSISTANT',
      content: assistantContent,
      presetType: body.presetType as any,
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  @Delete('messages')
  @ApiOperation({ summary: 'Clear chat history' })
  async clearMessages(@Request() req: any) {
    await this.chatService.clearMessages(req.user.id);
    return { success: true };
  }
}
