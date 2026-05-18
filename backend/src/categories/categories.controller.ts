import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
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
    return Object.values(AccountType).map((type) => {
      const labels: Record<
        string,
        { label: string; icon: string; color: string }
      > = {
        CASH: { label: 'Cash', icon: 'cash', color: '#34C759' },
        BANK: { label: 'Bank', icon: 'business', color: '#007AFF' },
        CREDIT: { label: 'Credit', icon: 'card', color: '#FF9500' },
        INVESTMENT: {
          label: 'Investment',
          icon: 'trending-up',
          color: '#5856D6',
        },
        DEBT: { label: 'Debt', icon: 'alert-circle', color: '#FF3B30' },
      };
      return { value: type, ...labels[type] };
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user categories' })
  async findAll(@Request() req: { user: { id: string } }) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create personal category' })
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoriesService.create(req.user.id, {
      name: body.name,
      type: body.type as 'INCOME' | 'EXPENSE',
      icon: body.icon,
      color: body.color,
      isBaseNeed: body.isBaseNeed,
      excludeFromTotal: body.excludeFromTotal,
      monthlyLimit: body.monthlyLimit
        ? BigInt(Math.round(body.monthlyLimit))
        : undefined,
      images: [],
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  async update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: UpdateCategoryDto,
  ) {
    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.icon !== undefined) data.icon = body.icon;
    if (body.color !== undefined) data.color = body.color;
    if (body.excludeFromTotal !== undefined)
      data.excludeFromTotal = body.excludeFromTotal;
    if (body.monthlyLimit === null) data.monthlyLimit = null;
    else if (body.monthlyLimit !== undefined)
      data.monthlyLimit = BigInt(Math.round(body.monthlyLimit));
    return this.categoriesService.update(id, req.user.id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  async delete(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.categoriesService.delete(id, req.user.id);
  }

  @Post('defaults')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create default categories for current user' })
  async createDefaults(@Request() req: { user: { id: string } }) {
    return this.categoriesService.createDefaultsForUser(req.user.id);
  }
}
