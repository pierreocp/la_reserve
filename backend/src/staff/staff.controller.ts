import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('restaurants/:restaurantId/staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get()
  findAll(@Param('restaurantId') restaurantId: string, @Request() req) {
    return this.staffService.findAll(restaurantId, req.user.id);
  }

  @Post()
  create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateStaffDto, @Request() req) {
    return this.staffService.create(restaurantId, dto, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: Partial<CreateStaffDto>,
    @Request() req,
  ) {
    return this.staffService.update(id, restaurantId, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('restaurantId') restaurantId: string, @Request() req) {
    return this.staffService.remove(id, restaurantId, req.user.id);
  }
}
