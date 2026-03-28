import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateServiceNoteDto } from './dto/create-service-note.dto';

@Injectable()
export class ServiceNotesService {
  constructor(
    private prisma: PrismaService,
    private restaurantsService: RestaurantsService,
  ) {}

  async findByDate(restaurantId: string, userId: string, date: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.serviceNote.findMany({
      where: { restaurantId, date: new Date(date) },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(restaurantId: string, dto: CreateServiceNoteDto, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.serviceNote.create({
      data: { ...dto, date: new Date(dto.date), restaurantId },
    });
  }

  async update(id: string, restaurantId: string, content: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.serviceNote.update({ where: { id }, data: { content } });
  }

  async remove(id: string, restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.serviceNote.delete({ where: { id } });
  }
}
