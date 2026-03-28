import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    private prisma: PrismaService,
    private restaurantsService: RestaurantsService,
  ) {}

  async findAll(restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.staff.findMany({ where: { restaurantId }, orderBy: { name: 'asc' } });
  }

  async create(restaurantId: string, dto: CreateStaffDto, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.staff.create({ data: { ...dto, restaurantId } });
  }

  async update(id: string, restaurantId: string, dto: Partial<CreateStaffDto>, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.staff.update({ where: { id }, data: dto });
  }

  async remove(id: string, restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    const staff = await this.prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Staff member not found');
    return this.prisma.staff.delete({ where: { id } });
  }
}
