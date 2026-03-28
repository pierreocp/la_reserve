import { IsString, IsInt, IsOptional, IsBoolean, IsEnum, IsArray, IsDateString, Min } from 'class-validator';
import { BookingStatus, BookingPeriod } from '@prisma/client';

export class CreateBookingDto {
  @IsDateString()
  date: string; // "2024-12-25"

  @IsString()
  startTime: string; // "12:30"

  @IsString()
  endTime: string; // "14:00"

  @IsEnum(BookingPeriod)
  period: BookingPeriod;

  @IsInt()
  @Min(1)
  pax: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  waitingList?: boolean;

  // Customer info — can be an existing customer id or inline creation
  @IsOptional()
  @IsString()
  customerId?: string;

  // Inline customer creation if customerId not provided
  @IsOptional()
  @IsString()
  customerFirstName?: string;

  @IsOptional()
  @IsString()
  customerLastName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tableIds?: string[];
}
