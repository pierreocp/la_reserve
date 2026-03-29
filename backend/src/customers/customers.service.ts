import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private restaurantsService: RestaurantsService,
  ) {}

  async findAll(restaurantId: string, userId: string, search?: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.customer.findMany({
      where: {
        restaurantCustomers: { some: { restaurantId } },
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        _count: { select: { bookings: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findOne(id: string, restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { restaurantId },
          orderBy: { date: 'desc' },
          take: 20,
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(restaurantId: string, dto: CreateCustomerDto, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.customer.create({
      data: {
        ...dto,
        restaurantCustomers: { create: { restaurantId } },
      },
    });
  }

  async update(id: string, restaurantId: string, dto: Partial<CreateCustomerDto>, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: string, restaurantId: string, userId: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);
    return this.prisma.restaurantCustomer.deleteMany({ where: { customerId: id, restaurantId } });
  }
}
