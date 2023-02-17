import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from 'src/entities/player.entity';
import { Repository } from 'typeorm';
import { AuthDto } from './dto/auth.dto';
import { sign } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config';

interface IPayload {
    name: string
    id: number
}

@Injectable()
export class AuthService {
    logger: Logger
    constructor(
        @InjectRepository(Player)
        public readonly playerRepository: Repository<Player>,
        private readonly configService: ConfigService
    ) {
        this.logger = new Logger()
    }

    async register(body: AuthDto) {
        try {
            const player = new Player()
            player.name = body.name

            const salt = 10
            const hashPassword = await bcrypt.hash(body.password, salt)
            player.hash = hashPassword

            const newPlayer = await this.playerRepository.save(player)

            const payload: IPayload = {
                name: body.name,
                id: newPlayer.id
            }

            return this.jwtSign(payload)
        } catch (error) {
            this.logger.error(error.message)
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async login(body: AuthDto) {
        try {
            const player = await this.playerRepository.findOneOrFail({ where: { name: body.name } })

            if (!player) {
                this.logger.error(`${body.name} Users not found`)
                throw new HttpException('User not found', HttpStatus.NOT_FOUND)
            }

            const decodePassword = await bcrypt.compare(body.password, player.hash)

            if (!decodePassword) {
                this.logger.error(`${body.name} user password is not valid`)
                throw new HttpException('password is not valid', HttpStatus.BAD_REQUEST)
            }

            const payload: IPayload = {
                name: player.name,
                id: player.id
            }
            return await this.jwtSign(payload)
        } catch (error) {
            this.logger.error(error.message)
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async jwtSign(payload: IPayload): Promise<string> {
        return sign(payload, this.configService.get('JWT_KEY'))
    }

}