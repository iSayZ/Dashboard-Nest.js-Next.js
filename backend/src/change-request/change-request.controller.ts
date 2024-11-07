import { Post, Body, Controller, UseGuards, Get, Param, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { updatePasswordAccountDto } from '../admin/dto/update-admin-account.dto';
import { ChangeRequestService } from './change-request.service';
import { User } from 'src/decorators/user.decorator';

@Controller('change-requests')
export class ChangeRequestController {
  constructor(private readonly changeRequestService: ChangeRequestService) {}

  // Route to create a change request to change password
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePasswordRequest(
    @Body() updatePasswordAccountDto: updatePasswordAccountDto,
    @User('sub') userId: string
  ) {
    return this.changeRequestService.changePasswordRequest(
      userId,
      updatePasswordAccountDto
    );
  }

  // Route to check validity token of change request
  @Get('verify/:token')
  async verifyChangeRequest(
    @Param('token') token: string,
  ) {
    // Verify token validity and get all infos of the change request
    const changeRequest = await this.changeRequestService.verifyTokenAndGetRequest(token);

    if (!changeRequest) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return { requestType: changeRequest.request_type };
  }

  // Route to apply change of the change request after check token
  @Post('confirm/:token')
  async confirmChangeRequest(
    @Param('token') token: string,
    @Body('requestType') requestType: string,
  ) {
    const changeRequest = await this.changeRequestService.verifyTokenAndGetRequest(token);
    console.log(changeRequest)
    console.log(requestType)
    if (!changeRequest || changeRequest.request_type !== requestType) {
      throw new UnauthorizedException('Invalid request');
    }

    // Process the request (e.g., change password, update email, etc.)
    const result = await this.changeRequestService.processChangeRequest(changeRequest);

    return result;
  }
}
