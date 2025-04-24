import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(login: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByLogin(login);
    const isMatch = await bcrypt.compare(pass, user?.password);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    const payload = {
      sub: user.id,
      login: user.login,
      role: 'Manager',
      branchId: user.branchId,
    };

    console.log(`payload: ${JSON.stringify(payload)}`);

    return {
      user: {
        ...result,
        role: payload.role,
        branchId: payload.branchId,
      },
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
