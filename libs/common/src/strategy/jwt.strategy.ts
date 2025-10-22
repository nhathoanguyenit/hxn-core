import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const authHeader = req?.headers?.authorization;
        const cookieJwt = req?.cookies?.jwt;

        console.log('Authorization Header:', authHeader);
        console.log('Cookie JWT:', cookieJwt);

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.substring(7);
          return token;
        }

        if (cookieJwt) {
          return cookieJwt;
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change_this_secret',
    });
  }

  async validate(payload: any, req: Request) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = {
      id: payload.sub,
      roles: payload.roles || [],
      ip: req.ip, 
    };

    return user; 
  }
}
