import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { UploadService } from 'src/upload/upload.service';
import { UpdateProfileAccountDto } from './dto/update-admin-profile.dto';
import {
  AdminAccount,
  AdminAccountDocument,
} from './schema/admin-account.schema';
import {
  AdminProfile,
  AdminProfileDocument,
} from './schema/admin-profile.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(AdminAccount.name)
    private adminAccountModel: Model<AdminAccountDocument>,
    @InjectModel(AdminProfile.name)
    private adminProfileModel: Model<AdminProfileDocument>,
  ) {}

  // To search and clean inactives sessions
  async cleanUpInactiveSessions(
    expirationDate: Date
  ): Promise<UpdateWriteOpResult> {
    const result = await this.adminAccountModel.updateMany(
      {},
      {
        $pull: {
          sessions: {
            created_at: { $lt: expirationDate },
          },
        },
      }
    );

    return result;
  }

  async readProfile(userId: string) {
    const adminProfile = await this.adminProfileModel
      .findOne({ admin_id: userId })
      .lean()
      .exec();
    const adminAccount = await this.adminAccountModel
      .findById(userId)
      .lean()
      .exec();

    if (!adminProfile) {
      throw new NotFoundException(`Profile not found.`);
    }

    if (!adminAccount) {
      throw new NotFoundException(`Account not found.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, admin_id, updated_at, ...filteredAdminProfile } = adminProfile;

    const settingsProfile = {
      ...filteredAdminProfile,
      last_login: adminAccount.last_login,
    };

    return settingsProfile;
  }

  async readSettingsProfile(userId: string) {
    const adminProfile = await this.adminProfileModel
      .findOne({ admin_id: userId })
      .lean()
      .exec();
    const adminAccount = await this.adminAccountModel
      .findById( userId )
      .lean()
      .exec();

    if (!adminProfile) {
      throw new NotFoundException(`Profile not found.`);
    }

    if (!adminAccount) {
      throw new NotFoundException(`Account not found.`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, admin_id, updated_at, ...filteredAdminProfile } = adminProfile;

    const settingsProfile = {
      ...filteredAdminProfile,
      last_login: adminAccount.last_login,
      two_fa_enabled: adminAccount.two_fa_enabled,
    };

    return settingsProfile;
  }

  // Route to update admin_profile
  async updateSettingsProfile(
    userId: string,
    updateProfileAccountDto: UpdateProfileAccountDto
  ): Promise<string> {
    // If a new avatar is upload, get the old avatar src for delete
    if (updateProfileAccountDto.avatar) {
      const adminProfile = await this.adminProfileModel
        .findOne({ admin_id: userId })
        .exec();

      if (adminProfile.avatar) {
        UploadService.deleteImage(adminProfile.avatar);
      }
    }

    // Update admin_profile
    const updatedProfile = await this.adminProfileModel
      .findOneAndUpdate({ admin_id: userId }, updateProfileAccountDto, {
        new: true,
      })
      .exec();

    if (!updatedProfile) {
      throw new NotFoundException(`Profile not found.`);
    }

    return 'Profile updated successfully';
  }

  async changePassword(userId: string, newValue: string) {
    const updatedAccount = await this.adminAccountModel
    .findOneAndUpdate(
      { _id: userId },
      { password: newValue },
      { new: true }
    )
    .exec();

    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }

    return {
      message: 'Password updated successfully',
      statusCode: HttpStatus.OK,
      redirectUrl: '/success'
    };
  }
}
