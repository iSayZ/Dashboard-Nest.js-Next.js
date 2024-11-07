import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import * as qrcode from 'qrcode';
import * as speakeasy from 'speakeasy';
import {
  AdminAccount,
  AdminAccountDocument,
} from 'src/admin/schema/admin-account.schema';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectModel(AdminAccount.name)
    private adminAccountModel: Model<AdminAccountDocument>
  ) {}

  // Timer to reset secret
  private timeoutId: NodeJS.Timeout;

  // --------------------------------------------------------- Crypt & Decrypt - Functions ---------------------------------------------------------

  private algorithm = 'aes-256-cbc';
  private secretKey = process.env.ENCRYPTION_KEY;

  // Méthode pour chiffrer le secret
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16); // IV aléatoire
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.secretKey),
      iv
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retourner l'IV + texte chiffré
    return iv.toString('hex') + ':' + encrypted;
  }

  // Méthode pour déchiffrer le secret
  private decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex'); // Utilisez '!' pour indiquer que le shift ne sera jamais null
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.secretKey),
      iv
    );
    let decrypted = decipher.update(encryptedText, undefined, 'utf8'); // Enlever le type d'entrée pour 'undefined'
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // --------------------------------------------------------- 2FA Services - Functions ---------------------------------------------------------

  // Function to generate and store backup codes
  async generateAndStoreBackupCodes(userId: string): Promise<string[]> {
    try {
      // Invalidate old codes (if they exist) - this line can be omitted if not required
      await this.adminAccountModel.updateOne(
        { _id: userId },
        { $set: { two_fa_backup_codes: [] } } // Clear existing backup codes
      );

      const backupCodes: string[] = []; // Array to hold plain text codes

      // Generate 10 unique 6-digit codes
      while (backupCodes.length < 5) {
        const code = crypto.randomInt(100000, 999999).toString(); // Generate a random 6-digit code
        backupCodes.push(code); // Store the plain text code
      }

      // Hash the codes with argon2
      const hashedCodes = await Promise.all(
        backupCodes.map((code) => argon2.hash(code))
      );

      // Store the hashed codes in the database
      await this.adminAccountModel.updateOne(
        { _id: userId },
        { $set: { two_fa_backup_codes: hashedCodes } } // Store new hashed codes
      );

      // Return the plain text backup codes
      return backupCodes; // Return only the raw codes
    } catch (error) {
      console.error('Error while generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  // To generate a new secret
  async initializeSecret(userId: string): Promise<string> {
    const account = await this.adminAccountModel.findById(userId);

    if (!account) {
      throw new NotFoundException('Aucun compte correspondant');
    }

    const { base32: secret, otpauth_url } = speakeasy.generateSecret({
      name: `${process.env.APP_NAME} : ${account.email}`,
    });

    // Hash secret before stock on BDD
    const cryptedSecret = this.encrypt(secret);

    // Save secret on BDD
    await this.adminAccountModel.findByIdAndUpdate(userId, {
      two_fa_secret: cryptedSecret,
      two_fa_enabled: false,
    });

    // Generate QR Code
    const qrCode = await qrcode.toDataURL(otpauth_url);

    if (this.timeoutId) {
      // If already have a timer started
      clearTimeout(this.timeoutId); // Clear previous timer
    }

    // Start the timer to reinitialize after 15 minutes
    this.timeoutId = setTimeout(
      async () => {
        await this.cleanupSecret(userId);
        console.info(
          new Date(),
          `Le secret a été réinitialisé pour l'utilisateur ${userId} après 15 minutes.`
        );
      },
      15 * 60 * 1000
    ); // 15min

    return qrCode;
  }

  // Check code and enable 2FA
  async verifyAndEnable(
    userId: string,
    token: string
  ): Promise<{ isValid: boolean; backupCodes: string[] }> {
    const account = await this.adminAccountModel.findById(userId);

    if (!account?.two_fa_secret) {
      throw new Error('Aucune configuration 2FA en cours');
    }

    const decryptedSecret = this.decrypt(account.two_fa_secret);

    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: token,
    });

    if (isValid) {
      //   Only active 2FA if the token is valid
      await this.adminAccountModel.findByIdAndUpdate(userId, {
        two_fa_enabled: true,
      });

      clearTimeout(this.timeoutId);
    }

    const backupCodes = await this.generateAndStoreBackupCodes(userId);
    return { isValid, backupCodes };
  }

  // Clean secret on BDD
  private async cleanupSecret(userId: string) {
    await this.adminAccountModel.findByIdAndUpdate(userId, {
      two_fa_secret: 'disabled',
      two_fa_enabled: false,
    });
  }

  // Clean secret in case of failure
  async reset2FA(userId: string): Promise<{ message: string }> {
    await this.cleanupSecret(userId);
    return { message: '2FA désactivée avec succès' };
  }

  // Get status 2FA of user
  async get2FAStatus(userId: string): Promise<boolean> {
    const account = await this.adminAccountModel.findById(userId);

    if (!account) {
      throw new NotFoundException('Aucun compte correspondant');
    }

    const status2FA = account.two_fa_enabled;

    return status2FA;
  }

  // Verify 2FA code
  async verifyTOTP(
    userId: string,
    code: string
  ): Promise<{ success: boolean }> {
    const account = await this.adminAccountModel.findById(userId);

    if (!account) {
      throw new NotFoundException('Aucun compte correspondant');
    }

    // Check if code is a backup code
    for (const backupCode of account.two_fa_backup_codes) {
      const backupCodeIsValid = await argon2.verify(backupCode, code);

      if (backupCodeIsValid) {
        await this.adminAccountModel.findByIdAndUpdate(userId, {
          $pull: { two_fa_backup_codes: backupCode },
        });

        return { success: true };
      }
    }

    const decryptedSecret = this.decrypt(account.two_fa_secret);
    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isValid) {
      throw new UnauthorizedException('Code 2FA invalide');
    }

    return { success: true };
  }
}
