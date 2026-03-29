import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  floor?: number;

  @IsOptional()
  @IsInt()
  canvasWidth?: number;

  @IsOptional()
  @IsInt()
  canvasHeight?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
