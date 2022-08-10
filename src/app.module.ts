import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'; // viene en node
import { PokemonModule } from './pokemon/pokemon.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'), }),

    MongooseModule.forRoot('mongodb://localhost:27017/nest-pokemon'),  // Conexión a la BBDD

    PokemonModule, CommonModule
  ],
})

export class AppModule {}