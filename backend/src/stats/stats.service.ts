import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantsService } from '../restaurants/restaurants.service';

@Injectable()
export class StatsService {
  constructor(
    private prisma: PrismaService,
    private restaurantsService: RestaurantsService,
  ) {}

  async getStats(restaurantId: string, userId: string, from: string, to: string) {
    await this.restaurantsService.assertAccess(restaurantId, userId);

    const bookings = await this.prisma.booking.findMany({
      where: {
        restaurantId,
        waitingList: false,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        date: { gte: new Date(from), lte: new Date(to) },
      },
      select: { pax: true, period: true, date: true },
    });

    const lunchCovers = bookings.filter((b) => b.period === 'LUNCH').reduce((s, b) => s + b.pax, 0);
    const dinnerCovers = bookings.filter((b) => b.period === 'DINNER').reduce((s, b) => s + b.pax, 0);

    // Group by date
    const byDate: Record<string, { lunch: number; dinner: number }> = {};
    for (const b of bookings) {
      const key = b.date.toISOString().split('T')[0];
      if (!byDate[key]) byDate[key] = { lunch: 0, dinner: 0 };
      if (b.period === 'LUNCH') byDate[key].lunch += b.pax;
      else byDate[key].dinner += b.pax;
    }

    return {
      lunchCovers,
      dinnerCovers,
      totalCovers: lunchCovers + dinnerCovers,
      totalBookings: bookings.length,
      byDate,
    };
  }
}
