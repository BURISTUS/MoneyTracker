import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Articles')
@Controller('articles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  @ApiQuery({ name: 'lang', required: false })
  async findAll(@Request() req: any, @Query('lang') lang?: string) {
    const language = lang || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
    return this.articlesService.findAll(language);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by id (increments view count)' })
  @ApiQuery({ name: 'lang', required: false })
  async findOne(@Param('id') id: string, @Request() req: any, @Query('lang') lang?: string) {
    const language = lang || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
    return this.articlesService.findOne(id, language);
  }

  @Post()
  @ApiOperation({ summary: 'Create article' })
  async create(
    @Request() req: any,
    @Body() body: { slug: string; tag: string; translations: Array<{ language: string; title: string; content: string; readTime: string }> },
  ) {
    return this.articlesService.create(body.slug, body.tag, body.translations);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update article' })
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { slug?: string; tag?: string; translations?: Array<{ language: string; title: string; content: string; readTime: string }> },
  ) {
    return this.articlesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.articlesService.delete(id);
  }
}
