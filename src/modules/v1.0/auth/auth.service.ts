import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto, LoginUserDto } from '../user/user.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}
  
  async register(dto: RegisterUserDto) {
    const response = await this.userService.createUser(dto);
    return response;
  }

  async login(dto: LoginUserDto) {
    console.log("a");
    const response = await this.userService.validateUser(dto);
    return response;
  }

  async validateToken(token_bearer: string) {
    // For static token bearer example:
    const user = await this.userService.findByToken(token_bearer);
    return user || null;
    
    // For JWT:
    // return this.jwtService.verifyAsync(token);
  }
}
