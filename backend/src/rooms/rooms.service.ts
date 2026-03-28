import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    private prisma: PrismaService,
    private restaurantsService: RestaurantsService,
  ) {}

  async findAll(restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.room.findMany({
      where: { restaurantId },
      include: { tables: { orderBy: { name: 'asc' } } },
      orderBy: [{ floor: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { tables: true },
    });
    if (!room) throw new NotFoundException('Room not found');
    await this.restaurantsService.assertAccess(room.restaurantId, userId);
    return room;
  }

  async create(restaurantId: string, dto: CreateRoomDto, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.room.create({ data: { ...dto, restaurantId } });
  }

  async update(id: string, dto: Partial<CreateRoomDto>, userId: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    await this.restaurantsService.assertAccess(room.restaurantId, userId);
    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    await this.restaurantsService.assertAccess(room.restaurantId, userId);
    return this.prisma.room.delete({ where: { id } });
  }
}
