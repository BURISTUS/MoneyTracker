import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/premium.guard';
import { ForecastService } from './forecast.service';
import { CreateForecastDto } from './dto/create-forecast.dto';
import { UpdateForecastDto } from './dto/update-forecast.dto';

@ApiTags('Forecast')
@ApiBearerAuth()
@Controller('forecast')
@UseGuards(JwtAuthGuard, PremiumGuard)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get()
  @ApiOperation({ summary: 'Get all forecast scenarios' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.forecastService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forecast scenario by ID' })
  findById(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.forecastService.findById(id, req.user.id);
  }

  @Get(':id/calculate')
  @ApiOperation({ summary: 'Calculate forecast projection' })
  calculate(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.forecastService.calculate(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a forecast scenario' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateForecastDto) {
    return this.forecastService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a forecast scenario' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateForecastDto,
  ) {
    return this.forecastService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a forecast scenario' })
  delete(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.forecastService.delete(id, req.user.id);
  }
}
