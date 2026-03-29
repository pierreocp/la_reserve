import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('restaurants/:restaurantId/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query('date') date: string,
    @Query('period') period: string,
    @Request() req,
  ) {
    return this.bookingsService.findAll(restaurantId, req.user.id, date, period);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('restaurantId') restaurantId: string, @Request() req) {
    return this.bookingsService.findOne(id, restaurantId, req.user.id);
  }

  @Post()
  create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(restaurantId, dto, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateBookingDto,
    @Request() req,
  ) {
    return this.bookingsService.update(id, restaurantId, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('restaurantId') restaurantId: string, @Request() req) {
    return this.bookingsService.remove(id, restaurantId, req.user.id);
  }
}
