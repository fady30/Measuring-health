import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('hashing')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  async hashData(@Body('password') password: string) {
    const result = await this.appService.encryptPassword(password);
    return { hashed: result };
  }
}