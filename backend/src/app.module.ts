import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { RoomsModule } from './rooms/rooms.module';
import { TablesModule } from './tables/tables.module';
import { CustomersModule } from './customers/customers.module';
import { BookingsModule } from './bookings/bookings.module';
import { StaffModule } from './staff/staff.module';
import { StatsModule } from './stats/stats.module';
import { ServiceNotesModule } from './service-notes/service-notes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RestaurantsModule,
    RoomsModule,
    TablesModule,
    CustomersModule,
    BookingsModule,
    StaffModule,
    StatsModule,
    ServiceNotesModule,
  ],
})
export class AppModule {}
