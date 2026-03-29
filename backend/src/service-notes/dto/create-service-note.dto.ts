import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { BookingPeriod } from '@prisma/client';

export class CreateServiceNoteDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(BookingPeriod)
  period?: BookingPeriod;

  @IsString()
  content: string;
}
