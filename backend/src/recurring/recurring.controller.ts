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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RecurringService } from './recurring.service';
import { CreateRecurringRuleDto } from './dto/create-recurring-rule.dto';
import { UpdateRecurringRuleDto } from './dto/update-recurring-rule.dto';

@ApiTags('Recurring')
@ApiBearerAuth()
@Controller('recurring')
@UseGuards(JwtAuthGuard)
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'Get all recurring rules' })
  findAll(@Request() req: { user: { id: string } }) {
    return this.recurringService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recurring rule by ID' })
  findById(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.recurringService.findById(id, req.user.id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview next N upcoming dates' })
  preview(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Query('count') count?: string,
  ) {
    return this.recurringService.preview(id, req.user.id, count ? parseInt(count, 10) : 3);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recurring rule' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateRecurringRuleDto) {
    return this.recurringService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recurring rule' })
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateRecurringRuleDto,
  ) {
    return this.recurringService.update(id, req.user.id, dto);
  }

  @Patch(':id/pause')
  @ApiOperation({ summary: 'Pause a recurring rule' })
  pause(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.recurringService.pause(id, req.user.id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a paused recurring rule' })
  activate(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.recurringService.activate(id, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recurring rule' })
  delete(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Query('keepTransactions') keepTransactions?: string,
  ) {
    const keep = keepTransactions !== 'false';
    return this.recurringService.delete(id, req.user.id, keep);
  }
}
