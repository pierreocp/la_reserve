import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('restaurants/:restaurantId/customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  findAll(
    @Param('restaurantId') restaurantId: string,
    @Query('search') search: string,
    @Request() req,
  ) {
    return this.customersService.findAll(restaurantId, req.user.id, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Param('restaurantId') restaurantId: string, @Request() req) {
    return this.customersService.findOne(id, restaurantId, req.user.id);
  }

  @Post()
  create(@Param('restaurantId') restaurantId: string, @Body() dto: CreateCustomerDto, @Request() req) {
    return this.customersService.create(restaurantId, dto, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Param('restaurantId') restaurantId: string,
    @Body() dto: Partial<CreateCustomerDto>,
    @Request() req,
  ) {
    return this.customersService.update(id, restaurantId, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Param('restaurantId') restaurantId: string, @Request() req) {
    return this.customersService.remove(id, restaurantId, req.user.id);
  }
}
