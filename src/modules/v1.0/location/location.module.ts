import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { Country } from '@/entities/country.entity';
import { City } from '@/entities/city.entity';
import { Province } from '@/entities/province.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City, Province], 'pg')],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
