import { IsString, IsNotEmpty } from 'class-validator';

class updatePasswordAccountDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

class updateMailAccountDto {
    @IsString()
    @IsNotEmpty()
    currentMailAdress: string;
  
    @IsString()
    @IsNotEmpty()
    newMailAdress: string;
}

export {
    updatePasswordAccountDto,
    updateMailAccountDto,
}
