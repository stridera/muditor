import { Module } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CharactersResolver } from './characters.resolver';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CharactersService, CharactersResolver],
  exports: [CharactersService],
})
export class CharactersModule {}
