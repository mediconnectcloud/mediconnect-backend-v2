import { IsIn, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString()
  @IsIn(['confirmed', 'cancelled', 'completed', 'no-show', 'available', 'booked', 'blocked', 'approved', 'rejected', 'pending'])
  status: string;
}
