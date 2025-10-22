import { Controller, Post, Body, Res, UseGuards, Get, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@libs/common/guards/jwt-auth.guard';
import { LoginDto } from './auth.dto';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReqAuth } from '@libs/common/decorators/req-auth.decorator';
import { HttpResp } from '@libs/common/utils/http';

@ApiTags('Auth')
@ApiBearerAuth('jwt-auth')
@ApiCookieAuth('jwt')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() { username, password }: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(username, password);
    const { access_token } = await this.authService.login(user);

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return HttpResp.success({ access_token });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user object' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@ReqAuth() user: Express.User) {
    const data = await this.authService.profile(user.id);
    return HttpResp.success(data);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return HttpResp.success();
  }
}
