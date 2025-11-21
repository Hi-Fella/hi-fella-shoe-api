import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { City } from '@/entities/city.entity';
import { Country } from '@/entities/country.entity';
import { User } from '@/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User, 'pg')
    private readonly userRepository: Repository<User>,
    @InjectRepository(City, 'pg')
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Country, 'pg')
    private readonly countryRepository: Repository<Country>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!!existingUser && existingUser.registration_step === null) {
      throw HttpResponseUtil.badRequest({
        message: 'Input tidak valid',
        field_errors: {
          email: 'email sudah digunakan.',
        },
      });
    }

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Generate token bearer
    const tokenBearer = crypto.randomBytes(32).toString('hex');

    // Generate token socket
    const dateStr = formatDate(new Date(), 'DDMMYYYY');
    const tokenSocketRaw = `user-${dateStr}${crypto.randomBytes(32).toString('hex')}`;
    const tokenSocket =
      crypto.createHash('md5').update(tokenSocketRaw).digest('hex') +
      crypto.randomBytes(3).toString('hex');

    if (!existingUser) {
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
    } else {
      // update existing user
      Object.assign(existingUser, {
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

      const savedUser = await this.userRepository.save(existingUser);
      return savedUser;
    }
  }

  async findByEmail(email: string) {
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

  async findOneById(id_user: string) {
    return this.userRepository.findOne({
      where: { id_user: id_user },
      relations: ['city', 'city.province', 'city.province.country'],
    });
  }

  async updateUser(id_user: string, updateData: UpdateUserDto) {
    // Check if user exists
    const user = await this.findOneById(id_user);
    if (!user) {
      throw HttpResponseUtil.notFound({
        message: 'User tidak ditemukan',
      });
    }

    // Validate city_id if provided
    if (updateData.city_id) {
      const city = await this.cityRepository.findOne({
        where: { id_city: updateData.city_id },
      });
      if (!city) {
        throw HttpResponseUtil.badRequest({
          message: 'City not found',
          field_errors: {
            city_id: 'City not found',
          },
        });
      }
    }

    // Validate phone_code if provided
    if (updateData.phone_code) {
      const country = await this.countryRepository.findOne({
        where: { phone_code: updateData.phone_code },
      });
      if (!country) {
        throw HttpResponseUtil.badRequest({
          message: 'Phone code not found',
          field_errors: {
            phone_code: 'Phone code not found',
          },
        });
      }
    }

    // Handle password hashing if password is provided
    if (updateData.password) {
      updateData.password = await this.hashPassword(updateData.password);
    }

    Object.assign(user, updateData);
    const savedUser = this.userRepository.save(user);

    return savedUser;
  }
}
