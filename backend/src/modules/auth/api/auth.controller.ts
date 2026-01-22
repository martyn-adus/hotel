import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginUseCase } from '../application/login.usecase';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../../shared/decorators/public.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return { user };
  }
}
