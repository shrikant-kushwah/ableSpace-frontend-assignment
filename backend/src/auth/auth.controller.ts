import { Body, Controller, Post, Patch, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('guest')
  async guestLogin(@Body('name') name: string) {
    return this.authService.guestLogin(name);
  }

  @Post('google-mock')
  async googleMockLogin(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('avatarUrl') avatarUrl: string,
  ) {
    return this.authService.googleMockLogin(email, name, avatarUrl);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() updates: any) {
    const updated = await this.usersService.update(req.user._id, updates);
    if (!updated) {
      throw new NotFoundException('User profile not found');
    }
    return {
      id: updated._id,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
      role: updated.role,
      email: updated.email,
      username: updated.username,
    };
  }
}
