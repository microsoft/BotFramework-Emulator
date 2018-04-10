import { Entity } from './Entity';

export interface LuisResponse {
  query: string;
  entities: Entity[];
}