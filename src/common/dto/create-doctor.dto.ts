import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fee?: number;
}
