import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountType } from '@prisma/client';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('icons')
  @ApiOperation({ summary: 'Get available icons for categories' })
  getIcons() {
    return this.categoriesService.getAvailableIcons();
  }

  @Get('types')
  @ApiOperation({ summary: 'Get account types' })
  getAccountTypes() {
    return Object.values(AccountType).map(type => {
      const labels: Record<string, { label: string; icon: string; color: string }> = {
        CASH: { label: 'Наличные', icon: 'cash', color: '#34C759' },
        BANK: { label: 'Банк', icon: 'business', color: '#007AFF' },
        CREDIT: { label: 'Кредит', icon: 'card', color: '#FF9500' },
        INVESTMENT: { label: 'Инвестиции', icon: 'trending-up', color: '#5856D6' },
        DEBT: { label: 'Долг', icon: 'alert-circle', color: '#FF3B30' },
      };
      return { value: type, ...labels[type] };
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user categories' })
  async findAll(@Request() req: any) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create personal category' })
  async create(@Request() req: any, @Body() body: { name: string; type: string; icon?: string; color?: string; isBaseNeed?: boolean; images?: string[] }) {
    return this.categoriesService.create(req.user.id, {
      name: body.name,
      type: body.type as any,
      icon: body.icon,
      color: body.color,
      isBaseNeed: body.isBaseNeed,
      images: body.images,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  async update(@Param('id') id: string, @Request() req: any, @Body() body: { name?: string; icon?: string; color?: string; images?: string[] }) {
    return this.categoriesService.update(id, req.user.id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.categoriesService.delete(id, req.user.id);
  }

  @Post('defaults')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create default categories for current user' })
  async createDefaults(@Request() req: any) {
    return this.categoriesService.createDefaultsForUser(req.user.id);
  }
}
