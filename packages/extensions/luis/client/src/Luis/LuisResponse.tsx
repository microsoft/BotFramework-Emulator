import { Entity } from './Entity';
import { Intent } from './Intent';
import { CompositeEntity } from '../Luis/CompositeEntity';

export interface LuisResponse {
  query: string;
  entities: Entity[];
  compositeEntities: CompositeEntity[];
  intents: Intent[];
  topScoringIntent: Intent;
}
