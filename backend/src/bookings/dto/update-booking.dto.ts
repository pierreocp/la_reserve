import { IsString, IsInt, IsOptional, IsBoolean, IsEnum, IsArray, Min } from 'class-validator';
import { BookingStatus, BookingPeriod } from '@prisma/client';

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsEnum(BookingPeriod)
  period?: BookingPeriod;

  @IsOptional()
  @IsInt()
  @Min(1)
  pax?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  waitingList?: boolean;

  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tableIds?: string[];
}
