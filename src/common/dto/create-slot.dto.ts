import { IsString, Matches } from 'class-validator';

export class CreateSlotDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'time must be in HH:mm format' })
  time: string;
}
