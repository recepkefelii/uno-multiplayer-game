import { Injectable } from "@nestjs/common";
import { Card, CardColor, CardValue } from "src/entities/card.entity";
import GameRules from "./service/card/card-dealing.service";



@Injectable()
export class Rules extends GameRules {

}