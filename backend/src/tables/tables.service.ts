import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoomsService } from '../rooms/rooms.service';
import { UpsertTableDto } from './dto/upsert-table.dto';

@Injectable()
export class TablesService {
  constructor(
    private prisma: PrismaService,
    private roomsService: RoomsService,
  ) {}

  async findAll(roomId: string, userId: string) {
    await this.roomsService.findOne(roomId, userId);
    return this.prisma.table.findMany({ where: { roomId }, orderBy: { name: 'asc' } });
  }

  async create(roomId: string, dto: UpsertTableDto, userId: string) {
    await this.roomsService.findOne(roomId, userId);
    return this.prisma.table.create({ data: { ...dto, roomId } });
  }

  async update(id: string, dto: Partial<UpsertTableDto>, userId: string) {
    const table = await this.prisma.table.findUnique({ where: { id }, include: { room: true } });
    if (!table) throw new NotFoundException('Table not found');
    await this.roomsService.findOne(table.roomId, userId);
    return this.prisma.table.update({ where: { id }, data: dto });
  }

  // Bulk update positions after drag-drop in floor plan editor
  async bulkUpdatePositions(roomId: string, tables: Array<{ id: string; x: number; y: number; rotation?: number }>, userId: string) {
    await this.roomsService.findOne(roomId, userId);
    return Promise.all(
      tables.map(({ id, x, y, rotation }) =>
        this.prisma.table.update({ where: { id }, data: { x, y, ...(rotation !== undefined && { rotation }) } }),
      ),
    );
  }

  async remove(id: string, userId: string) {
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');
    await this.roomsService.findOne(table.roomId, userId);
    return this.prisma.table.delete({ where: { id } });
  }
}
