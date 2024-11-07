import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import {
  AdminAccount,
  AdminAccountSchema,
} from './schema/admin-account.schema';
import {
  AdminProfile,
  AdminProfileSchema,
} from './schema/admin-profile.schema';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminAccount.name, schema: AdminAccountSchema },
      { name: AdminProfile.name, schema: AdminProfileSchema },
    ]),
    AuthModule,
    MailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
