import { Get, Post, Put, Body, Controller, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateProfileAccountDto } from './dto/update-admin-profile.dto';
import { User } from 'src/decorators/user.decorator';
import { updatePasswordAccountDto } from './dto/update-admin-account.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('profile')
  async readProfile(@User('sub') userId: string) {
    return this.adminService.readProfile(userId);
  }

  @Get('settings')
  async readSettingsProfile(
    @User('sub') userId: string
  ) {
    return this.adminService.readSettingsProfile(userId);
  }

  @Put('profile/update')
  async updateProfile(
    @Body() updateProfileAccountDto: UpdateProfileAccountDto,
    @User('sub') userId: string
  ) {
    return this.adminService.updateSettingsProfile(
      userId,
      updateProfileAccountDto
    );
  }
}
