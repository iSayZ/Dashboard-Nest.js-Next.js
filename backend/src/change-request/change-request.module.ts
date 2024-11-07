import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { ChangeRequestService } from './change-request.service';
import { ChangeRequestController } from './change-request.controller';
import {
  AdminAccount,
  AdminAccountSchema,
} from '../admin/schema/admin-account.schema';
import {
  AdminProfile,
  AdminProfileSchema,
} from '../admin/schema/admin-profile.schema';
import { MailModule } from 'src/mail/mail.module';
import { ChangeRequest, ChangeRequestSchema } from './schema/change-request.schema';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminAccount.name, schema: AdminAccountSchema },
      { name: AdminProfile.name, schema: AdminProfileSchema },
      { name: ChangeRequest.name, schema: ChangeRequestSchema},
    ]),
    AuthModule,
    MailModule,
    AdminModule,
  ],
  controllers: [ChangeRequestController],
  providers: [ChangeRequestService],
})
export class ChangeRequestModule {}
