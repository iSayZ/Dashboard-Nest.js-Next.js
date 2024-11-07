import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { UploadService } from 'src/upload/upload.service';
import { UpdateProfileAccountDto } from '../admin/dto/update-admin-profile.dto';
import {
  AdminAccount,
  AdminAccountDocument,
} from '../admin/schema/admin-account.schema';
import {
  AdminProfile,
  AdminProfileDocument,
} from '../admin/schema/admin-profile.schema';
import { updatePasswordAccountDto } from '../admin/dto/update-admin-account.dto';
import { AuthService } from 'src/auth/auth.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ChangeRequest, ChangeRequestDocument } from './schema/change-request.schema';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class ChangeRequestService {
  constructor(
    @InjectModel(AdminAccount.name)
    private adminAccountModel: Model<AdminAccountDocument>,
    @InjectModel(AdminProfile.name)
    private adminProfileModel: Model<AdminProfileDocument>,
    @InjectModel(ChangeRequest.name)
    private changeRequestModel: Model<ChangeRequestDocument>,
    private authService: AuthService,
    private adminService: AdminService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  // Generate an unique token to create a change request
  private async generateTokenToChangeRequest(uniqueId: string): Promise<string> {
    const payload = {
      changeRequestId: uniqueId,
    }

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });

    return token;
  }

  // Generate token and stock the change request on BDD
  private async saveChangeRequest(userId: string, requestType: string, newValue: string): Promise<string> {
    // Generate an unique id for the change request
    const uniqueId = this.authService.generateSessionId();

    // Generate token available 1h with unique id
    const token = await this.generateTokenToChangeRequest(uniqueId);

    // Create the change request on BDD
    const changeRequest = new this.changeRequestModel({
        change_request_id: uniqueId,
        token,
        user_id: userId,
        request_type: requestType,
        new_value: newValue,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 60 * 60 * 1000), // Expire in 1h
    });

    await changeRequest.save();

    return token;
  }

  // To delete the change request
  async deleteChangeRequest(changeRequestId: string): Promise<void> {
    // Rechercher le document en utilisant le champ `change_request_id`
    const changeRequest = await this.changeRequestModel.findOne({ change_request_id: changeRequestId }).exec();
  
    if (!changeRequest) {
      throw new NotFoundException('Change request not found');
    }
  
    await this.changeRequestModel.deleteOne({ change_request_id: changeRequestId }).exec();
  }
  
  // To check validity token and get the request on BDD
  async verifyTokenAndGetRequest(token: string): Promise<ChangeRequestDocument | null> {
    try {
      // Check token
      const payload = this.jwtService.verify(token);
      const changeRequestId = payload.changeRequestId;
      
      // Search on BDD
      return await this.changeRequestModel.findOne({ change_request_id: changeRequestId });
    } catch (error) {
      return null; // If token invalid or expired
    }
  }

  // To apply the good proccess at the request type
  async processChangeRequest(changeRequest: ChangeRequestDocument): Promise<any> {
    switch (changeRequest.request_type) {
      case 'change_password':
        const passwordResult = this.adminService.changePassword(changeRequest.user_id, changeRequest.new_value);
        await this.deleteChangeRequest(changeRequest.change_request_id);
        return passwordResult;
      case 'change_email':
        return
      case 'reset_password':
        return
      case 'reset_2fa_backup_codes':
        return
      default:
        throw new NotFoundException('Request type not supported');
    }
  }

  // Route to generate a change request to change password
  async changePasswordRequest(
    userId: string,
    updatePasswordAccountDto: updatePasswordAccountDto
  ) {
    // Check if the current password matches with account
    const password = updatePasswordAccountDto.currentPassword;

    const account = await this.adminAccountModel.findById( userId ).exec();

    if (!account) {
      throw new NotFoundException(`Aucun compte correspondant.`);
    }

    const isPasswordValid = await this.authService.verifyPassword(
      account.password,
      password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(`Le mot de passe est incorrect.`);
    }

    // Get the profile info corresponding to the account for the mail
    const profile = await this.adminProfileModel.findOne({ admin_id: userId }).exec();

    if (!profile) {
      throw new NotFoundException(`Aucun compte correspondant.`);
    }

    // Hash password before stock
    const hashedPassword = await this.authService.hashPassword(updatePasswordAccountDto.newPassword);

    // Generate and stock the token on BDD
    const changePasswordToken = await this.saveChangeRequest(userId, 'change_password', hashedPassword);

    // Send an email to the user to confirm the action
    await this.mailService.sendConfirmPasswordChangeMail(account, profile, changePasswordToken);
  }
}
