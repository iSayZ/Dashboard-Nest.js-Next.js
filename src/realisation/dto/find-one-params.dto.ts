import { IsString, IsNotEmpty } from 'class-validator';

export class FindOneParams {
  @IsString()
  @IsNotEmpty()
  id: string;
}
