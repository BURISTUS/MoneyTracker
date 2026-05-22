import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('Articles')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiQuery({ name: 'lang', required: false })
  async findAll(
    @Request() req: { headers: Record<string, string> },
    @Query('lang') lang?: string,
  ) {
    const language =
      lang ||
      req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
      'en';
    return this.articlesService.findAll(language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by id (increments view count)' })
  @ApiQuery({ name: 'lang', required: false })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user?: { id: string }; headers: Record<string, string> },
    @Query('lang') lang?: string,
  ) {
    const language =
      lang ||
      req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
      'en';
    const userId = req.user?.id;
    return this.articlesService.findOne(id, language, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create article (admin only)' })
  async create(@Body() body: CreateArticleDto) {
    return this.articlesService.create(body.slug, body.tag, body.translations);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update article (admin only)' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article (admin only)' })
  async delete(@Param('id') id: string) {
    return this.articlesService.delete(id);
  }
}
