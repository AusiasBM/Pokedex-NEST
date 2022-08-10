import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';


@Injectable()
export class SeedService {
  
  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ){}
  
  async executeSeed(){

    await this.pokemonModel.deleteMany({}); // delete * from pokemons
    
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    const pokemonToInsert: { name: string, no: number }[] = [];

    data.results.forEach(( {name, url} ) => {
      const segments = url.split('/');
      const no: number = +segments[ segments.length -2 ];

      // insertPromisesArray.push(
      //   this.pokemonModel.create({name, no})
      // );

      pokemonToInsert.push({ name, no }); // [{ name: bulbasaur, no: 1 }]
  
    });

    await this.pokemonModel.insertMany(pokemonToInsert); // Esto hace una inserción de todos los pokemons a la vez 

    return 'Seed Executed';
  }
}
