import { Controller, Get, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from "express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('login')
  @Render('login')
  showLogin(@Req() req: Request) {
    const redirect = req.query.redirect || '/';
    return {
      appName: this.appService.getAppName(),
      title: 'Login',
      redirect,
      error: null,
    };
  }
}
