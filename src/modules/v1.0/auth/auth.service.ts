import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { User } from '@/entities/user.entity';
import { UserService } from '@/modules/v1.0/user/user.service';
import { Injectable } from '@nestjs/common';
import {
  CompleteProfileDto,
  CompleteProfileResponseData,
  LoginUserDto,
  LoginUserResponseData,
  RegisterUserDto,
  RegisterUserResponseData,
} from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async register(
    dto: RegisterUserDto,
    ip: string,
  ): Promise<RegisterUserResponseData> {
    const userWithRelations = await this.userService.createUser(dto);

    // Create login history record with token
    await this.userService.findOrCreateUserLoginHistory({
      token: userWithRelations.token_bearer,
      user_id: userWithRelations.id_user,
      ip_address: ip,
      browser: dto.browser,
      device_info: dto.device_info,
    });

    // Format user data for response
    const userData: RegisterUserResponseData['user'] = {
      id: userWithRelations.id_user,
      email: userWithRelations.email,
      name: userWithRelations.name,
      phone_code: userWithRelations.phone_code,
      phone: userWithRelations.phone,
      gender: userWithRelations.gender,
      birth_date: userWithRelations.birthdate
        ? formatDate(userWithRelations.birthdate, 'DD MMM YYYY')
        : null,
      country: userWithRelations?.city?.province?.country
        ? {
            id: userWithRelations.city.province.country.id_country.toString(),
            name: userWithRelations.city.province.country.name_country,
          }
        : null,
      city:
        userWithRelations?.city && userWithRelations.city.province?.country
          ? {
              id: userWithRelations.city.id_city.toString(),
              country: userWithRelations.city.province.country.name_country,
            }
          : null,
    };

    return {
      registration_type: userWithRelations.registration_type || 'manual',
      registration_complete: false,
      token_bearer: userWithRelations.token_bearer,
      token_socket: userWithRelations.token_socket,
      user: userData,
    };
  }

  async login(dto: LoginUserDto, ip: string): Promise<LoginUserResponseData> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw HttpResponseUtil.unauthorized({
        message: 'Invalid credentials',
        field_errors: {
          email:
            "We couldn't recognize that email. Please make sure it's correct.",
        },
      });
    }

    const match = await this.userService.checkHashedPassword(
      dto.password,
      user.password,
    );
    if (!match) {
      throw HttpResponseUtil.unauthorized({
        message: 'Invalid credentials',
        field_errors: {
          password: 'Incorrect password. Double-check and try again.',
        },
      });
    }

    // Create login history record
    const loginHistory = await this.userService.findOrCreateUserLoginHistory({
      user_id: user.id_user,
      ip_address: ip,
      browser: dto.browser,
      device_info: dto.device_info,
    });

    return {
      token_bearer: loginHistory.token,
      token_socket: user.token_socket,
      user: {
        id: user.id_user,
        email: user.email,
        name: user.name,
        phone_code: user.phone_code,
        phone: user.phone,
        gender: user.gender,
        birth_date: user.birthdate
          ? user.birthdate.toISOString().split('T')[0]
          : null,
        country: user.city?.province?.country
          ? {
              id: user.city.province.country.id_country.toString(),
              name: user.city.province.country.name_country,
            }
          : null,
        city:
          user.city && user.city.province?.country
            ? {
                id: user.city.id_city.toString(),
                country: user.city.province.country.name_country,
              }
            : null,
      },
    };
  }

  async validateToken(token_bearer: string) {
    const user = await this.userService.findByToken(token_bearer);
    return user;

    // For JWT:
    // return this.jwtService.verifyAsync(token);
  }

  async completeProfile(
    user: User,
    dto: CompleteProfileDto,
  ): Promise<CompleteProfileResponseData> {
    // validate registration step
    if (user.registration_step !== 1) {
      throw HttpResponseUtil.badRequest({
        message: 'Registration had been completed previously',
      });
    }

    // Update user profile with the provided data
    await this.userService.updateUser(user.id_user, {
      name: dto.fullname,
      gender: dto.gender,
      birthdate: dto.birth_date,
      city_id: dto.city_id,
      phone_code: dto.phone_code,
      phone: dto.phone_number,
      registration_step: null,
      finish_registration_at: new Date().toISOString(),
    });

    // Get the updated user
    const userWithRelations = await this.userService.findOneById(user.id_user);
    if (!userWithRelations) {
      throw HttpResponseUtil.notFound({ message: 'User not found' });
    }

    // Format user data for response
    const userData: CompleteProfileResponseData['user'] = {
      id: userWithRelations.id_user,
      email: userWithRelations.email,
      name: userWithRelations.name,
      phone_code: userWithRelations.phone_code,
      phone: userWithRelations.phone,
      gender: userWithRelations.gender,
      birth_date: userWithRelations.birthdate
        ? formatDate(userWithRelations.birthdate, 'DD MMM YYYY')
        : null,
      country: userWithRelations?.city?.province?.country
        ? {
            id: userWithRelations.city.province.country.id_country.toString(),
            name: userWithRelations.city.province.country.name_country,
          }
        : null,
      city:
        userWithRelations?.city && userWithRelations.city.province?.country
          ? {
              id: userWithRelations.city.id_city.toString(),
              country: userWithRelations.city.province.country.name_country,
            }
          : null,
    };

    return {
      registration_type: userWithRelations.registration_type,
      registration_complete: true,
      token_bearer: user.token_bearer,
      token_socket: userWithRelations.token_socket,
      user: userData,
    };
  }
}
