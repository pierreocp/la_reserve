import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    await this.assertNameUnique(roomId, dto.name);
    return this.prisma.table.create({ data: { ...dto, roomId } });
  }

  async update(id: string, dto: Partial<UpsertTableDto>, userId: string) {
    const table = await this.prisma.table.findUnique({ where: { id }, include: { room: true } });
    if (!table) throw new NotFoundException('Table not found');
    await this.roomsService.findOne(table.roomId, userId);
    if (dto.name && dto.name !== table.name) {
      await this.assertNameUnique(table.roomId, dto.name, id);
    }
    return this.prisma.table.update({ where: { id }, data: dto });
  }

  private async assertNameUnique(roomId: string, name: string, excludeId?: string) {
    const existing = await this.prisma.table.findFirst({
      where: { roomId, name: { equals: name, mode: 'insensitive' }, ...(excludeId && { NOT: { id: excludeId } }) },
    });
    if (existing) throw new ConflictException(`Une table nommée "${name}" existe déjà dans cette salle`);
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
