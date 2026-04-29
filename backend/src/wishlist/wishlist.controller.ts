import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get all wishlist items' })
  async findAll(@Request() req: any) {
    return this.wishlistService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to wishlist' })
  async create(@Request() req: any, @Body() body: { name: string; price: number; description?: string; category?: string; cooldownDays?: number }) {
    const item = await this.wishlistService.create(req.user.id, {
      ...body,
      description: body.description || '',
      price: BigInt(body.price),
    });
    return { ...item, price: Number(item.price) };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject item - conscious choice!' })
  async reject(@Param('id') id: string, @Request() req: any) {
    return this.wishlistService.reject(req.user.id, id);
  }

  @Post(':id/purchase')
  @ApiOperation({ summary: 'Purchase item' })
  async purchase(@Param('id') id: string, @Request() req: any) {
    return this.wishlistService.purchase(req.user.id, id);
  }

  @Post(':id/snooze')
  @ApiOperation({ summary: 'Snooze for 7 more days' })
  async snooze(@Param('id') id: string, @Request() req: any) {
    return this.wishlistService.snooze(req.user.id, id);
  }
}
