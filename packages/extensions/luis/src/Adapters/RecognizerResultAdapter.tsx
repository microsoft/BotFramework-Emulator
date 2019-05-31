//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { CompositeEntity } from '../Luis/CompositeEntity';
import { Entity } from '../Luis/Entity';
import { LuisResponse } from '../Luis/LuisResponse';
import { Intent } from '../Models/Intent';
import { RecognizerResult, RecognizerResultIntent } from '../Models/RecognizerResults';

// This adapter adapts the old LUIS Response schema to the the new schema
// since v3 of the BotBuilder SDKs don't support the new schemas, so this
// adapter allows teh extension to give a similar experience for both SDKs
export class RecognizerResultAdapter implements RecognizerResult {
  public text: string;
  public intents: { [key: string]: RecognizerResultIntent };
  public entities: any;

  constructor(luisResult: LuisResponse) {
    this.text = luisResult.query;
    this.intents = this.getIntents(luisResult);
    this.entities = this.getEntitiesAndMetadata(luisResult.entities, luisResult.compositeEntities, true);
  }

  private normalizeName(name: string): string {
    return name.replace(/\./g, '_');
  }

  private getIntents(luisResult: LuisResponse): { [key: string]: RecognizerResultIntent } {
    const intents: { [name: string]: RecognizerResultIntent } = {};
    if (luisResult.intents) {
      luisResult.intents.reduce((prev: { [key: string]: RecognizerResultIntent }, curr: Intent) => {
        prev[curr.intent] = { score: curr.score };
        return prev;
      }, intents);
    } else {
      const topScoringIntent = luisResult.topScoringIntent;
      intents[this.normalizeName(topScoringIntent.intent)] = {
        score: topScoringIntent.score,
      };
    }
    return intents;
  }

  private getEntitiesAndMetadata(
    entities: Entity[],
    compositeEntities: CompositeEntity[] | undefined,
    verbose: boolean
  ): any {
    const entitiesAndMetadata: any = verbose ? { $instance: {} } : {};
    let compositeEntityTypes: string[] = [];

    // We start by populating composite entities so that entities covered by them are removed from the entities list
    if (compositeEntities) {
      compositeEntityTypes = compositeEntities.map(compositeEntity => compositeEntity.parentType);
      compositeEntities.forEach(compositeEntity => {
        entities = this.populateCompositeEntity(compositeEntity, entities, entitiesAndMetadata, verbose);
      });
    }

    entities.forEach(entity => {
      // we'll address composite entities separately
      if (compositeEntityTypes.indexOf(entity.type) > -1) {
        return;
      }

      this.addProperty(entitiesAndMetadata, this.getNormalizedEntityType(entity), this.getEntityValue(entity));
      if (verbose) {
        this.addProperty(
          entitiesAndMetadata.$instance,
          this.getNormalizedEntityType(entity),
          this.getEntityMetadata(entity)
        );
      }
    });

    return entitiesAndMetadata;
  }

  private getEntityValue(entity: Entity): any {
    if (!entity.resolution) {
      return entity.entity;
    }

    if ((entity || '').type.startsWith('builtin.datetimeV2.')) {
      if (!entity.resolution.values || !entity.resolution.values.length) {
        return entity.resolution;
      }

      const vals = entity.resolution.values;
      const type = vals[0].type;
      const timexes = vals.map((t: any) => t.timex);
      const distinct = timexes.filter((v: any, i: any, a: any) => a.indexOf(v) === i);
      return { type, timex: distinct };
    } else {
      const res = entity.resolution;
      switch (entity.type) {
        case 'builtin.number':
        case 'builtin.ordinal':
          return Number(res.value);
        case 'builtin.percentage': {
          let svalue = res.value;
          if (svalue.endsWith('%')) {
            svalue = svalue.substring(0, svalue.length - 1);
          }
          return Number(svalue);
        }
        case 'builtin.age':
        case 'builtin.dimension':
        case 'builtin.currency':
        case 'builtin.temperature': {
          const val = res.value;
          const obj: any = {};
          if (val) {
            obj.number = Number(val);
          }
          obj.units = res.unit;
          return obj;
        }
        default:
          return Object.keys(entity.resolution).length > 1
            ? entity.resolution
            : entity.resolution.value
            ? entity.resolution.value
            : entity.resolution.values;
      }
    }
  }

  private getEntityMetadata(entity: Entity): any {
    return {
      startIndex: entity.startIndex,
      endIndex: entity.endIndex + 1,
      text: entity.entity,
      score: entity.score,
    };
  }

  private getNormalizedEntityType(entity: Entity): string {
    // Type::Role -> Role
    let type = entity.type.split(':').pop() || '';
    if (type.startsWith('builtin.datetimeV2.')) {
      type = 'builtin_datetime';
    }
    if (type.startsWith('builtin.currency')) {
      type = 'builtin_money';
    }
    if (entity.role != null) {
      type = entity.role;
    }
    return type.replace(/\./g, '_');
  }

  private populateCompositeEntity(
    compositeEntity: CompositeEntity,
    entities: Entity[],
    entitiesAndMetadata: any,
    verbose: boolean
  ): Entity[] {
    const childrenEntites: any = verbose ? { $instance: {} } : {};
    let childrenEntitiesMetadata: any = {};

    // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
    const compositeEntityMetadata: Entity | undefined = entities.find(entity => {
      // For now we are matching by value, which can be ambiguous if the same composite entity
      // shows up with the same text multiple times within an utterance, but this is just a
      // stop gap solution till the indices are included in composite entities
      return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value;
    });

    const filteredEntities: Entity[] = [];
    if (verbose && compositeEntityMetadata) {
      childrenEntitiesMetadata = this.getEntityMetadata(compositeEntityMetadata);
      childrenEntitiesMetadata.$instance = {};
    }

    // This is now implemented as O(n*k) search and can be reduced to O(n + k)
    // using a map as an optimization if n or k grow
    const coveredSet = new Set();
    compositeEntity.children.forEach(childEntity => {
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (
          !coveredSet.has(i) &&
          childEntity.type === entity.type &&
          compositeEntityMetadata &&
          entity.startIndex !== undefined &&
          compositeEntityMetadata.startIndex !== undefined &&
          entity.startIndex >= compositeEntityMetadata.startIndex &&
          entity.endIndex !== undefined &&
          compositeEntityMetadata.endIndex !== undefined &&
          entity.endIndex <= compositeEntityMetadata.endIndex
        ) {
          // Add to the set to ensure that we don't consider the same child entity more than once per composite
          coveredSet.add(i);
          this.addProperty(childrenEntites, this.getNormalizedEntityType(entity), this.getEntityValue(entity));

          if (verbose) {
            this.addProperty(
              childrenEntites.$instance,
              this.getNormalizedEntityType(entity),
              this.getEntityMetadata(entity)
            );
          }
        }
      }
    });

    // filter entities that were covered by this composite entity
    for (let i = 0; i < entities.length; i++) {
      if (!coveredSet.has(i)) {
        filteredEntities.push(entities[i]);
      }
    }

    this.addProperty(entitiesAndMetadata, compositeEntity.parentType, childrenEntites);
    if (verbose) {
      this.addProperty(entitiesAndMetadata.$instance, compositeEntity.parentType, childrenEntitiesMetadata);
    }

    return filteredEntities;
  }

  /**
   * If a property doesn't exist add it to a new array, otherwise append it to the existing array
   * @param obj Object on which the property is to be set
   * @param key Property Key
   * @param value Property Value
   */
  private addProperty(obj: any, key: string, value: any) {
    if (key in obj) {
      obj[key] = obj[key].concat(value);
    } else {
      obj[key] = [value];
    }
  }
}
