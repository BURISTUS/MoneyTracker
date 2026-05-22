import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { RequirePremium } from '../common/require-premium.decorator';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard, PremiumGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @RequirePremium('WISHLIST_INCUBATOR')
  @ApiOperation({ summary: 'Get all wishlist items' })
  async findAll(@Request() req: { user: { id: string } }) {
    return this.wishlistService.findAll(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Add item to wishlist' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateWishlistDto,
  ) {
    const item = await this.wishlistService.create(req.user.id, {
      name: body.name,
      price: BigInt(body.price),
      description: body.description || '',
      category: body.category,
      cooldownDays: body.cooldownDays,
    });
    return { ...item, price: Number(item.price) };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject item - conscious choice!' })
  async reject(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.wishlistService.reject(req.user.id, id);
  }

  @Post(':id/purchase')
  @ApiOperation({ summary: 'Purchase item' })
  async purchase(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.wishlistService.purchase(req.user.id, id);
  }

  @Post(':id/snooze')
  @ApiOperation({ summary: 'Snooze for 7 more days' })
  async snooze(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.wishlistService.snooze(req.user.id, id);
  }
}
