import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAllForUser(userId: string) {
    return this.prisma.restaurant.findMany({
      where: { restaurantUsers: { some: { userId } } },
      include: { rooms: { select: { id: true, name: true, floor: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        rooms: { include: { tables: true } },
        staff: true,
        restaurantUsers: { include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } } },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    await this.assertAccess(id, userId);
    return restaurant;
  }

  async create(dto: CreateRestaurantDto, userId: string) {
    return this.prisma.restaurant.create({
      data: {
        ...dto,
        restaurantUsers: { create: { userId, role: 'OWNER' } },
        rooms: { create: { name: 'Salle principale', floor: 0 } },
      },
    });
  }

  async update(id: string, dto: Partial<CreateRestaurantDto>, userId: string) {
    await this.assertAccess(id, userId);
    return this.prisma.restaurant.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    await this.assertAccess(id, userId);
    return this.prisma.restaurant.delete({ where: { id } });
  }

  async assertAccess(restaurantId: string, userId: string) {
    const link = await this.prisma.restaurantUser.findUnique({
      where: { userId_restaurantId: { userId, restaurantId } },
    });
    if (!link) throw new ForbiddenException('Access denied');
  }
}
