import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('restaurants/:restaurantId/rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  findAll(@Param('restaurantId') restaurantId: string, @Request() req) {
    return this.roomsService.findAll(restaurantId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.roomsService.findOne(id, req.user.id);
  }

  @Post()
  create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateRoomDto, @Request() req) {
    return this.roomsService.create(restaurantId, dto, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRoomDto>, @Request() req) {
    return this.roomsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.roomsService.remove(id, req.user.id);
  }
}
