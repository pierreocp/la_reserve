import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private restaurantsService: RestaurantsService,
  ) {}

  async findAll(restaurantId: string, userId: string, date?: string, period?: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.booking.findMany({
      where: {
        restaurantId,
        ...(date && { date: new Date(date) }),
        ...(period && { period: period as any }),
      },
      include: {
        customer: true,
        staff: true,
        bookingTables: { include: { table: { include: { room: true } } } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string, restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        staff: true,
        bookingTables: { include: { table: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(restaurantId: string, dto: CreateBookingDto, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);

    let customerId = dto.customerId;

    // Create customer on the fly if no customerId provided
    if (!customerId) {
      const customer = await this.prisma.customer.create({
        data: {
          firstName: dto.customerFirstName || '',
          lastName: dto.customerLastName || '',
          email: dto.customerEmail,
          phone: dto.customerPhone,
          restaurantCustomers: { create: { restaurantId } },
        },
      });
      customerId = customer.id;
    }

    const booking = await this.prisma.booking.create({
      data: {
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        period: dto.period,
        pax: dto.pax,
        status: dto.status || 'RESERVED',
        notes: dto.notes,
        waitingList: dto.waitingList || false,
        confirmationToken: randomBytes(16).toString('hex'),
        restaurantId,
        customerId,
        staffId: dto.staffId,
        ...(dto.tableIds?.length && {
          bookingTables: { create: dto.tableIds.map((tableId) => ({ tableId })) },
        }),
      },
      include: { customer: true, staff: true, bookingTables: { include: { table: true } } },
    });

    return booking;
  }

  async update(id: string, restaurantId: string, dto: UpdateBookingDto, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    const { tableIds, ...rest } = dto;

    await this.prisma.booking.update({
      where: { id },
      data: {
        ...rest,
        ...(rest.date && { date: new Date(rest.date) }),
        ...(tableIds !== undefined && {
          bookingTables: {
            deleteMany: {},
            create: tableIds.map((tableId) => ({ tableId })),
          },
        }),
      },
    });

    return this.findOne(id, restaurantId, userId);
  }

  async remove(id: string, restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.booking.delete({ where: { id } });
  }
}
