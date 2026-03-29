import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ServiceNotesService } from './service-notes.service';
import { CreateServiceNoteDto } from './dto/create-service-note.dto';

@Controller('restaurants/:restaurantId/service-notes')
@UseGuards(JwtAuthGuard)
export class ServiceNotesController {
  constructor(private serviceNotesService: ServiceNotesService) {}

  @Get()
  findByDate(
    @Param('restaurantId') restaurantId: string,
    @Query('date') date: string,
    @Request() req,
  ) {
    return this.serviceNotesService.findByDate(restaurantId, req.user.id, date);
  }

  @Post()
  create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateServiceNoteDto, @Request() req) {
    return this.serviceNotesService.create(restaurantId, dto, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
    @Body() body: { content: string },
    @Request() req,
  ) {
    return this.serviceNotesService.update(id, restaurantId, body.content, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('restaurantId') restaurantId: string, @Request() req) {
    return this.serviceNotesService.remove(id, restaurantId, req.user.id);
  }
}
