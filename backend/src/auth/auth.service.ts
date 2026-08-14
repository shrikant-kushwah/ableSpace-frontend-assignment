import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private oauthClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async guestLogin(name: string) {
    const user = await this.usersService.findOrCreateGuest(
      name || 'Guest User',
    );
    const payload = { username: user.name, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        email: user.email,
      },
    };
  }

  async googleMockLogin(email: string, name: string, avatarUrl: string) {
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.create(
        name,
        avatarUrl,
        email,
        'Team Member',
      );
    }
    const payload = { username: user.name, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        email: user.email,
      },
    };
  }

  async googleLogin(token: string) {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      const { email, name, picture } = payload;
      if (!email) {
        throw new Error('Email not provided by Google');
      }

      let user = await this.usersService.findByEmail(email);
      if (!user) {
        user = await this.usersService.create(
          name || 'Google User',
          picture || 'https://api.dicebear.com/7.x/adventurer/svg?seed=google',
          email,
          'Team Member',
        );
      } else if (picture && user.avatarUrl !== picture) {
        await this.usersService.update(user._id.toString(), { avatarUrl: picture });
      }

      const jwtPayload = { username: user.name, sub: user._id, role: user.role };
      return {
        access_token: this.jwtService.sign(jwtPayload),
        user: {
          id: user._id,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role,
          email: user.email,
        },
      };
    } catch (error) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }
}
