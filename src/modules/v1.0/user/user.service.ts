import { HttpResponseUtil } from '@/common/utils/httpresponse.util';
import { UserLoginHistory } from '@/entities/user-login-history.entity';
import { City } from '@/entities/city.entity';
import { Country } from '@/entities/country.entity';
import { User } from '@/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { I18nService } from 'nestjs-i18n';
import { UserRepository } from '@/common/repositories/user.repository';
import { UserLoginHistoryRepository } from '@/common/repositories/user-login-history.repository';
import { GoogleSheetsService } from '@/google-sheets/google-sheets.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly userRepository: UserRepository,
    @InjectRepository(City, 'pg')
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Country, 'pg')
    private readonly countryRepository: Repository<Country>,
    private readonly userLoginHistoryRepository: UserLoginHistoryRepository,
    private readonly i18n: I18nService,
    private readonly googleSheetsService: GoogleSheetsService,
    @InjectQueue('user-sync-gsheet') private userSyncQueue: Queue,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async checkHashedPassword(password: string, otherPassword: string) {
    return await bcrypt.compare(password, otherPassword);
  }

  generateBearerToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateSocketToken() {
    const dateStr = formatDate(new Date(), 'DDMMYYYY');
    const tokenSocketRaw = `user-${dateStr}${crypto.randomBytes(32).toString('hex')}`;
    const tokenSocket =
      crypto.createHash('md5').update(tokenSocketRaw).digest('hex') +
      crypto.randomBytes(3).toString('hex');
    return tokenSocket;
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!!existingUser && existingUser.registration_step === null) {
      throw HttpResponseUtil.badRequest({
        message: this.i18n.t(
          'validation.auth.RegisterUserDto.email.isAlreadyRegistered',
        ),
        field_errors: {
          email: this.i18n.t(
            'validation.auth.RegisterUserDto.email.isAlreadyRegistered',
          ),
        },
      });
    }

    // Hash password
    let hashedPassword: string | undefined = undefined;
    if (!!dto.password) {
      hashedPassword = await this.hashPassword(dto.password);
    }

    // Generate token for login history
    const token = this.generateBearerToken();

    // Generate token socket for user entity
    const tokenSocket = this.generateSocketToken();

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
        google_id: dto.google_id,
        token_bearer: token,
        token_socket: tokenSocket,
        registration_step: 1,
        registration_type: !!dto.google_id ? 'google' : 'manual',
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
    const user = this.userRepository.findOne({
      where: { email },
      relations: ['city', 'city.province', 'city.province.country'],
    });

    return user;
  }

  async findByToken(token_bearer: string) {
    const loginHistory = await this.userLoginHistoryRepository.findOne({
      where: { token: token_bearer },
      relations: ['user'],
    });

    if (!!loginHistory?.user) {
      loginHistory.user.token_bearer = token_bearer;
      return loginHistory.user;
    }

    return null;
  }

  async findBySocketToken(token_socket: string) {
    const user = this.userRepository.findOne({
      where: { token_socket },
      relations: ['city', 'city.province', 'city.province.country'],
    });

    return user;
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
        message: this.i18n.t('general.userNotFound'),
      });
    }

    // Validate city_id if provided
    if (updateData.city_id) {
      const city = await this.cityRepository.findOne({
        where: { id_city: updateData.city_id },
      });
      if (!city) {
        throw HttpResponseUtil.badRequest({
          message: this.i18n.t('general.cityNotFound'),
          field_errors: {
            city_id: this.i18n.t('general.cityNotFound'),
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
          message: this.i18n.t('general.phoneCodeNotFound'),
          field_errors: {
            phone_code: this.i18n.t('general.phoneCodeNotFound'),
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

  async findOrCreateUserLoginHistory(loginData: {
    user_id: string;
    ip_address: string;
    browser?: string;
    device_info?: string;
    token?: string;
    city_id?: string;
    city_name?: string;
    isp_provider?: string;
  }): Promise<UserLoginHistory> {
    // First, try to find existing login history
    if (!!loginData.user_id && !!loginData.ip_address) {
      const existingHistory = await this.userLoginHistoryRepository.findOne({
        where: {
          user_id: loginData.user_id,
          ip_address: loginData.ip_address,
          device_info: loginData.device_info,
          browser: loginData.browser,
        },
        relations: ['user'],
      });

      if (!!existingHistory) {
        return existingHistory;
      }
    }

    // If not found, create a new login history record
    if (!loginData?.token) {
      loginData.token = this.generateBearerToken();
    }
    const loginHistory = this.userLoginHistoryRepository.create({
      ...loginData,
    });

    return this.userLoginHistoryRepository.save(loginHistory);
  }

  async getUserLoginHistory(userId: string): Promise<UserLoginHistory[]> {
    return this.userLoginHistoryRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async syncUserToGoogleSheets(
    userId: string,
  ): Promise<{ updated: boolean; message: string }> {
    // Find user in database with all relations
    const user = await this.userRepository.findOne({
      where: { id_user: userId },
      relations: ['city', 'city.province', 'city.province.country'],
    });

    if (!user) {
      return { updated: false, message: 'User not found' };
    }

    // Check if user exists in Google Sheets
    const existingRows = await this.googleSheetsService.findRowsByColumns({
      sheetName: 'User',
      columnFilters: { 'Email Address': user.email },
    });

    // Prepare user data for Google Sheets
    const userData = [
      user.name || '', // Account Name
      user.email || '', // Email Address
      user.phone || '', // Phone
      '', // Company Name
      '', // Company Category
      '', // Job Title
      user.city?.name_city || '', // City
      user.city?.province?.country?.name_country || '', // Country
      user.registration_step === null ? 'Finish' : 'Unfinish', // Registration Status
      user.registration_step?.toString() || '', // Registration Step
      formatDate(user.created_at, 'DD MMMM YYYY'), // Created At
      user.utm_id || '', // UTM ID
      user.utm_source || '', // UTM Source
      user.utm_medium || '', // UTM Medium
      user.utm_campaign || '', // UTM Campaign
      user.utm_term || '', // UTM Term
      user.utm_content || '', // UTM Content
      '', // Business Type
    ];

    if (existingRows.length > 0) {
      // Update existing row
      const rowIndex = existingRows[0].rowIndex; // 0-based index for the range
      const range = `User!A${rowIndex + 1}:R${rowIndex + 1}`; // Convert to 1-based for range

      await this.googleSheetsService.write({
        range,
        values: [userData],
      });

      return { updated: true, message: 'User data updated in Google Sheets' };
    } else {
      // Append new row
      await this.googleSheetsService.append({
        sheetName: 'User',
        values: userData,
      });

      return { updated: true, message: 'User data added to Google Sheets' };
    }
  }

  async syncUserToGoogleSheetsQueue(
    userId: string,
    email: string,
  ): Promise<void> {
    const jobName = `${this.userSyncQueue.name}-job`;
    const jobId = `${jobName}-${userId}`;

    // remove similar job if available
    const currentSimilarJob = await this.userSyncQueue.getJob(jobId);
    if (!!currentSimilarJob) {
      await currentSimilarJob.remove();
    }

    await this.userSyncQueue.add(
      jobName,
      {
        userId,
        email,
        requeued: 0,
      },
      {
        jobId,
      },
    );
    this.logger.log(`${jobId} job queued for email: ${email}`);
  }
}
