import { IsInt, IsNotEmpty, IsString } from "class-validator"
import { CardColor, CardValue } from "src/entities/card.entity"

export class CardsDto {
    @IsInt()
    @IsNotEmpty()
    id: number

    @IsString()
    @IsNotEmpty()
    cardValue: CardValue
    
    @IsString()
    @IsNotEmpty()
    cardColor: CardColor
}