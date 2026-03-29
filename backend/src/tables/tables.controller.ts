import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TablesService } from './tables.service';
import { UpsertTableDto } from './dto/upsert-table.dto';

@Controller('rooms/:roomId/tables')
@UseGuards(JwtAuthGuard)
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Get()
  findAll(@Param('roomId') roomId: string, @Request() req) {
    return this.tablesService.findAll(roomId, req.user.id);
  }

  @Post()
  create(@Param('roomId') roomId: string, @Body() dto: UpsertTableDto, @Request() req) {
    return this.tablesService.create(roomId, dto, req.user.id);
  }

  @Put('bulk-positions')
  bulkUpdatePositions(
    @Param('roomId') roomId: string,
    @Body() body: { tables: Array<{ id: string; x: number; y: number; rotation?: number }> },
    @Request() req,
  ) {
    return this.tablesService.bulkUpdatePositions(roomId, body.tables, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<UpsertTableDto>, @Request() req) {
    return this.tablesService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tablesService.remove(id, req.user.id);
  }
}
