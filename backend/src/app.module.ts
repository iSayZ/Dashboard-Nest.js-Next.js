import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RealisationsModule } from './realisation/realisation.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { TwoFactorModule } from './twofactor/twofactor.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './guards/custom-throttler.guard';
import { ScheduledTasksModule } from './jobs/scheduled-tasks.module';
import { MailModule } from './mail/mail.module';
import { ChangeRequestModule } from './change-request/change-request.module';

@Module({
  imports: [
    // Load envFile
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'uploads'), // URL to load an image = localhost:PORT/filename.png
    }),
    // Connect to MongoDB
    MongooseModule.forRoot(process.env.MONGODB_URI),
    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL),
        limit: Number(process.env.THROTTLE_LIMIT),
      },
    ]),
    RealisationsModule,
    AuthModule,
    AdminModule,
    UploadModule,
    TwoFactorModule,
    ScheduledTasksModule,
    MailModule,
    ChangeRequestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
