import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Response } from 'express';
import mongoose, { Model } from 'mongoose';
import {
  AdminAccount,
  AdminAccountDocument,
} from '../admin/schema/admin-account.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AdminAccount.name)
    private adminAccountModel: Model<AdminAccountDocument>,
    private jwtService: JwtService
  ) {}

  // --------------------------------------------------------- Crypt & Decrypt - Functions ---------------------------------------------------------

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async verifyPassword(
    accountPassword: string,
    password: string
  ): Promise<boolean> {
    return await argon2.verify(accountPassword, password);
  }

  // --------------------------------------------------------- Tokens - Functions ---------------------------------------------------------

  // Function to generate and stock the tokens
  private async generateTokens(
    account: AdminAccountDocument,
    ip: string,
    userAgent: string
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Generate sessionId to identificate the session
    const sessionId = this.generateSessionId();
    console.log('generate session id', sessionId);
    // Content of payload
    const payload = {
      session: sessionId,
      sub: account._id,
      access_level: account.access_level,
    };

    // Generate access_token, with expiration of 15mins
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Generate refresh_token, with expiration of 7days
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Hash the refresh_token
    const hashedRefreshToken = await this.hashPassword(refresh_token);

    // Find account to push the new session
    const adminAccount = await this.adminAccountModel.findById(account._id);

    if (!adminAccount) {
      throw new Error('Aucun compte correspondant');
    }

    // Body of object session
    const newSession = {
      session_id: sessionId,
      ip,
      user_agent: userAgent,
      refresh_token: hashedRefreshToken,
      created_at: new Date(),
    };

    console.log('session id de newSession', newSession);

    // Push the new session into account
    try {
      adminAccount.sessions.push(newSession);
      await adminAccount.save();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Impossible de récupérer les informations de session. Veuillez réessayer.'
      );
    }

    return {
      access_token,
      refresh_token,
    };
  }

  // Function to refresh a new tokens by refresh_token if it is valid
  async refreshTokens(
    refreshToken: string,
    response: Response,
    ip: string,
    userAgent: string
  ): Promise<string> {
    try {
      // Verify validity of refresh_token and extract the payload
      const payload = await this.jwtService.verifyAsync(refreshToken);

      // Find the account match of payload sub
      const account = await this.adminAccountModel.findById(payload.sub);

      if (!account) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      console.log('Payload session refresh ', payload.session);
      // Get index of session
      const currentIndexSession = account.sessions.findIndex(
        (session) => session.session_id === payload.session
      );

      if (currentIndexSession < 0) {
        throw new UnauthorizedException('Invalid session');
      }

      // Get session with index
      const currentSession = account.sessions[currentIndexSession];

      // Check if IP or User-Agent matches
      const isIpMatch = currentSession.ip === ip;
      const isUserAgentMatch = currentSession.user_agent === userAgent;

      if (!(isIpMatch || isUserAgentMatch)) {
        throw new UnauthorizedException('Unauthorized access');
      }

      // Verify if the hashed refresh_token stocked in session of account matches
      const isRefreshTokenValid = await argon2.verify(
        currentSession.refresh_token,
        refreshToken
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Delete old session before regenerate new tokens
      await this.adminAccountModel.updateOne(
        { _id: account._id },
        {
          $pull: { sessions: { session_id: currentSession.session_id } },
          $set: { last_login: new Date() },
        }
      );

      // Generates new tokens
      const tokens = await this.generateTokens(account, ip, userAgent);

      // Set cookies
      response.cookie('access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 15, // 15min
      });

      response.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
      });

      return 'Refresh réussi';
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // --------------------------------------------------------- Auth Services - Functions ---------------------------------------------------------

  // Function to generate unique ID (objectId from mongoose)
  generateSessionId(): string {
    return new mongoose.Types.ObjectId().toString();
  }

  // Function to check login logs to allow access
  private async validateUser(
    loginDto: LoginDto
  ): Promise<AdminAccountDocument> {
    const email = loginDto.email.toLowerCase();
    const password = loginDto.password;

    const account = await this.adminAccountModel.findOne({ email }).exec();

    if (!account) {
      throw new NotFoundException(`L'email ou le mot de passe est incorrect.`);
    }

    const isPasswordValid = await this.verifyPassword(
      account.password,
      password
    );

    if (!isPasswordValid) {
      throw new NotFoundException(`L'email ou le mot de passe est incorrect.`);
    }

    return account;
  }

  // First step of login, to validate login logs and check 2FA status
  async validateCredentials(
    loginDto: LoginDto,
    response: Response
  ): Promise<AdminAccountDocument> {
    const account = await this.validateUser(loginDto);

    // Generate a temporary token if 2FA is enabled
    if (account.two_fa_enabled) {
      const temporaryToken = await this.jwtService.signAsync(
        { sub: account._id, type: 'temporary' },
        { expiresIn: '5m' }
      );

      // Set temporary cookie
      response.cookie('temporary_token', temporaryToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        maxAge: 1000 * 60 * 5, // 5min
      });

      return account;
    }

    return account;
  }

  // Function to check temporary_token (2FA) is valid
  async validateTemporaryToken(token: string): Promise<AdminAccountDocument> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.type !== 'temporary') {
        throw new UnauthorizedException('Token invalide');
      }
      return this.adminAccountModel.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('Token invalide');
    }
  }

  // Last step of login to set the cookies
  async completeLogin(
    account: AdminAccountDocument,
    response: Response,
    ip: string,
    userAgent: string
  ): Promise<string> {
    const tokens = await this.generateTokens(account, ip, userAgent);

    // Set cookies
    response.cookie('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 15, // 15min
    });

    response.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
    });

    return 'Connexion réussie';
  }

  // Function to logout, delete session and clear cookies
  async logout(
    id: string,
    sessionId: string,
    response: Response
  ): Promise<string> {
    // Delete session before clear cookies
    await this.adminAccountModel.updateOne(
      { _id: id },
      { $pull: { sessions: { session_id: sessionId } } }
    );

    // Delete cookies
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    response.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    return 'Déconnexion réussie';
  }

  // Function to check password of an user
  async verifyIdentity(id: string, password: string): Promise<string> {
    const account = await this.adminAccountModel.findById(id).exec();

    if (!account) {
      throw new NotFoundException(`Le mot de passe est incorrect.`);
    }

    const isPasswordValid = await this.verifyPassword(
      account.password,
      password
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Le mot de passe est incorrect.');
    }

    return 'Vérification réussie';
  }
}
