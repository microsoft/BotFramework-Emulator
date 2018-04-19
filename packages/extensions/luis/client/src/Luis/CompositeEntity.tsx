import { Entity } from './Entity';

export interface CompositeEntity extends Entity {
  parentType: string;
  value: any;
  children: any[];
}