import { Module } from '@nestjs/common';
import { ServiceNotesController } from './service-notes.controller';
import { ServiceNotesService } from './service-notes.service';
import { RestaurantsModule } from '../restaurants/restaurants.module';

@Module({
  imports: [RestaurantsModule],
  controllers: [ServiceNotesController],
  providers: [ServiceNotesService],
})
export class ServiceNotesModule {}
