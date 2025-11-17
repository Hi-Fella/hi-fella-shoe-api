import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { RegisterUserDto, LoginUserDto } from './user.dto';
import { ConfigService } from '@nestjs/config';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UserService {
  constructor(private readonly config: ConfigService) {}
  private users: any[] = []; // mock database

  async createUser(dto: RegisterUserDto) {
    const exists = this.users.find(u => u.email === dto.email);
    if (exists) throw new Error('Email already registered');

    // const rounds = Number(this.config.get('BCRYPT_SALT_ROUNDS', 10));
    const rounds = "abd";
    // console.log(rounds, typeof rounds);
    const hashedPassword = await bcrypt.hash(dto.password, rounds);
    // $token_bearer = date("dmYHis") . substr($user->uuid, 0, 5) . Str::random(8);
    // uuid is unused, so empty string 
    const random = crypto.randomBytes(4).toString('hex');
    const token_bearer = dayjs().format('DDMMYYYYHHmmss') + '' + random.toString();

    const user = {
      id_user: this.users.length + 1,
      email: dto.email,
      password: hashedPassword,
      token_bearer: token_bearer,
      name: dto.name,
      age: dto.age
    };
    this.users.push(user);

    return {
      code: 201,
      status: 'success',
      message: 'User registered',
      data: { id_user: user.id_user, email: user.email, token_bearer: token_bearer }
    };
  }

  async validateUser(dto: LoginUserDto) {
    const user = this.users.find(u => u.email === dto.email);
    if (!user) return {
      code: 404,
      status: 'failed',
      message: 'User not found',
      data: null
    };

    const match = await bcrypt.compare(dto.password, user.password);
    if (match) {
      return {
        code: 200,
        status: 'success',
        message: 'Logged in',
        data: { id: user.id, email: user.email, token_bearer: user.token_bearer }
      };
    } else {
      return {
        code: 404,
        status: 'failed',
        message: 'User not found',
        data: null
      }
    }
  }

  async findByToken(token_bearer: string) {
    return this.users.find(u => u.token_bearer === token_bearer);
  }

  async viewUser(id_user: BigInteger) {
    return this.users.find(u => u.id_user === id_user)
  }
}
