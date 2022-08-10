import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,

    private readonly configService: ConfigService,
  ){

    this.defaultLimit = configService.get<number>('defaultLimit');
    //console.log({ defaultLimit: configService.get<number>('defaultLimit') })
  }


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;

    } catch (error) {
      this.handledExceptions(error);
    }

    
  }

  findAll( paginationDto: PaginationDto ) {

    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModel.find()
    .limit( limit ).
    skip( offset )
    .sort({
      no: 1 // ordena de manera ascendente
    })
    .select('-__v')
    ;
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;

    if( !isNaN( +term ) ){
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if ( !pokemon && isValidObjectId( term ) )
      pokemon = await this.pokemonModel.findById( term );

    if ( !pokemon ) // Si no tenemos ningún pokemon vamos a buscarlo por nombre
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() }); // trim quita los espacios de delante y detras

    if ( !pokemon )
      throw new NotFoundException( `Pokemon con id, name o no "${ term }" no encontrado` );

    return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne(term);

    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    try {
      await pokemon.updateOne( updatePokemonDto);
      
    } catch (error) {
      this.handledExceptions(error);
    }
    

    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id );
    
    // await pokemon.deleteOne();
    // return { id };
    //const result = await this.pokemonModel.findByIdAndDelete( id );

    // Con esta forma solo hacemos una petición a la BBDD
    const { deletedCount, acknowledged } = await this.pokemonModel.deleteOne({ _id: id });

    if( deletedCount == 0 )
      throw new BadRequestException( `Pokemon con id "${id}" not found` );

    return;

  }



  private handledExceptions( error: any ){

    if(error.code === 11000){
      throw new BadRequestException(`El pokemon existe en la BBDD ${ JSON.stringify( error.keyValue ) }`)
    }
    console.log(error);
    throw new InternalServerErrorException(`No se a podido actualizar el Pokemon - Revisa el Log`)


  }
}
