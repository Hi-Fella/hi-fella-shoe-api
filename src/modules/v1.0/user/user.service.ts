import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto, UserData } from './user.dto';
import { User } from '@/entities/user.entity';
import { HttpResponseUtil } from '@/common/utils/httpresponse.util';

@Injectable()
export class UserService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User, 'pg')
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw HttpResponseUtil.badRequest({
        message: 'Input tidak valid',
        field_errors: {
          email: 'E-mail sudah terdaftar.',
        },
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // Generate token bearer
    const tokenBearer = crypto.randomBytes(32).toString('hex');

    // Generate token socket
    const dateStr = formatDate(new Date(), 'DDMMYYYY');
    const tokenSocketRaw = `user-${dateStr}${crypto.randomBytes(32).toString('hex')}`;
    const tokenSocket =
      crypto.createHash('md5').update(tokenSocketRaw).digest('hex') +
      crypto.randomBytes(3).toString('hex');

    // Create new user
    const newUser = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      utm_id: dto.utm_id,
      utm_source: dto.utm_source,
      utm_medium: dto.utm_medium,
      utm_campaign: dto.utm_campaign,
      utm_term: dto.utm_term,
      utm_content: dto.utm_content,
      token_bearer: tokenBearer,
      token_socket: tokenSocket,
      registration_step: 1,
      registration_type: 'manual',
      account_status: true, // Set default account status
    });

    // Save user to database
    const savedUser = await this.userRepository.save(newUser);

    return savedUser;
  }

  async findUserWithRelations(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: ['city', 'city.province', 'city.province.country'],
    });
  }

  async findByToken(token_bearer: string) {
    return this.userRepository.findOne({
      where: { token_bearer },
      relations: ['city', 'city.province', 'city.province.country'],
    });
  }

  async viewUser(id_user: string) {
    return this.userRepository.findOne({
      where: { id_user: id_user },
      relations: ['city', 'city.province', 'city.province.country'],
    });
  }
}
