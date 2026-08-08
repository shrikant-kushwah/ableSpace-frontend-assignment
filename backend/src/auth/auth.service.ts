import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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
}
