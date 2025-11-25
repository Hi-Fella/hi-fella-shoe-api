import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { User } from '@/entities/user.entity';
import { UserService } from '@/modules/v1.0/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  CompleteProfileDto,
  CompleteProfileResponseData,
  LoginUserDto,
  LoginUserResponseData,
  LoginWithoutPasswordDto,
  RegisterUserDto,
  RegisterUserResponseData,
  RegisterWithoutPasswordDto,
  ValidateGoogleOAuthDto,
  ValidateGoogleOAuthResponseData,
} from './auth.dto';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  async register(
    dto: RegisterUserDto,
    ip: string,
  ): Promise<RegisterUserResponseData> {
    const userWithRelations = await this.userService.createUser(dto);
    throw new Error('asdad');

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
            id: userWithRelations.city.province.country.id_country,
            name: userWithRelations.city.province.country.name_country,
          }
        : null,
      city:
        userWithRelations?.city && userWithRelations.city.province?.country
          ? {
              id: userWithRelations.city.id_city,
              name: userWithRelations.city.name_city,
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

  async registerWithoutPassword(
    dto: RegisterWithoutPasswordDto,
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
            id: userWithRelations.city.province.country.id_country,
            name: userWithRelations.city.province.country.name_country,
          }
        : null,
      city:
        userWithRelations?.city && userWithRelations.city.province?.country
          ? {
              id: userWithRelations.city.id_city,
              name: userWithRelations.city.name_city,
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
        message: this.i18n.t(
          'validation.auth.LoginUserDto.email.isAlreadyRegistered',
        ),
        field_errors: {
          email: this.i18n.t(
            'validation.auth.LoginUserDto.email.isAlreadyRegistered',
          ),
        },
      });
    }

    const match = await this.userService.checkHashedPassword(
      dto.password,
      user.password,
    );
    if (!match) {
      throw HttpResponseUtil.unauthorized({
        message: this.i18n.t(
          'validation.auth.LoginUserDto.password.isPasswordCorrect',
        ),
        field_errors: {
          password: this.i18n.t(
            'validation.auth.LoginUserDto.password.isPasswordCorrect',
          ),
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
      registration_type: user.registration_type,
      registration_complete: user.registration_step === null,
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
              id: user.city.province.country.id_country,
              name: user.city.province.country.name_country,
            }
          : null,
        city:
          user.city && user.city.province?.country
            ? {
                id: user.city.id_city,
                name: user.city.name_city,
              }
            : null,
      },
    };
  }

  async loginWithoutPassword(
    dto: LoginWithoutPasswordDto,
    ip: string,
  ): Promise<LoginUserResponseData> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw HttpResponseUtil.unauthorized({
        message: this.i18n.t(
          'validation.auth.LoginUserDto.email.isAlreadyRegistered',
        ),
        field_errors: {
          email: this.i18n.t(
            'validation.auth.LoginUserDto.email.isAlreadyRegistered',
          ),
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
      registration_type: user.registration_type,
      registration_complete: user.registration_step === null,
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
              id: user.city.province.country.id_country,
              name: user.city.province.country.name_country,
            }
          : null,
        city:
          user.city && user.city.province?.country
            ? {
                id: user.city.id_city,
                name: user.city.name_city,
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
        message: 'Profil sudah dilengkapi sebelumnya',
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
      throw HttpResponseUtil.notFound({
        message: this.i18n.t('general.userNotFound'),
      });
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
            id: userWithRelations.city.province.country.id_country,
            name: userWithRelations.city.province.country.name_country,
          }
        : null,
      city:
        userWithRelations?.city && userWithRelations.city.province?.country
          ? {
              id: userWithRelations.city.id_city,
              name: userWithRelations.city.name_city,
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

  async validateGoogleOAuth(
    dto: ValidateGoogleOAuthDto,
  ): Promise<ValidateGoogleOAuthResponseData> {
    // validate the token by calling Google's tokeninfo endpoint
    const tokenInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=${dto.access_token}`,
    );

    if (!tokenInfoResponse.ok) {
      this.logger.error(
        `Google oAuth Token validation failed: ${tokenInfoResponse.statusText}`,
      );
      throw HttpResponseUtil.unauthorized({
        message: this.i18n.t(
          'validation.auth.ValidateGoogleOAuthDto.access_token.isFailed',
        ),
      });
    }

    const tokenInfo = await tokenInfoResponse.json();

    // Verify the token is issued for your client
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (tokenInfo.audience !== clientId) {
      this.logger.error(
        `Google oAuth Token audience mismatch. Expected: ${clientId}, Got: ${tokenInfo.audience}`,
      );
      throw HttpResponseUtil.unauthorized({
        message: this.i18n.t(
          'validation.auth.ValidateGoogleOAuthDto.access_token.isFailed',
        ),
      });
    }

    // Get user information using the access token
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${dto.access_token}`,
        },
      },
    );

    if (!userInfoResponse.ok) {
      this.logger.error(
        `Google oAuth Failed to fetch user info: ${userInfoResponse.statusText}`,
      );
      throw HttpResponseUtil.unauthorized({
        message: this.i18n.t(
          'validation.auth.ValidateGoogleOAuthDto.access_token.isFailed',
        ),
      });
    }

    const userInfo = await userInfoResponse.json();

    return {
      user_info: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        verified_email: userInfo.verified_email,
        locale: userInfo.locale,
      },
      token_info: {
        access_token: dto.access_token,
        expires_in: parseInt(tokenInfo.expires_in),
        scope: tokenInfo.scope,
      },
    };
  }
}
