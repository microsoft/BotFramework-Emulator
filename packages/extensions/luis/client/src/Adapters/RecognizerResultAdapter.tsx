import { RecognizerResult } from '../Models/RecognizerResults';
import { LuisResponse } from '../Luis/LuisResponse';
import { Entity } from '../Luis/Entity';
import { CompositeEntity } from '../Luis/CompositeEntity';
import { Intent } from '../Models/Intent';

// This adapter adapts the old LUIS Response schema to the the new schema
// since v3 of the BotBuilder SDKs don't support the new schemas, so this 
// adapter allows teh extension to give a similar experience for both SDKs
export class RecognizerResultAdapter implements RecognizerResult {
  text: string;
  intents: any;
  entities: any;

  constructor(luisResult: LuisResponse) {
    this.text = luisResult.query;
    this.intents =  this.getIntents(luisResult);
    this.entities = this.getEntitiesAndMetadata(luisResult.entities, luisResult.compositeEntities, true);
  }

  private getIntents(luisResult: LuisResponse): any {
    const intents: { [name: string]: number; }  = {};
    if (luisResult.intents) {
        luisResult.intents.reduce((prev: any, curr: Intent) => {
            prev[curr.intent] = curr.score;
            return prev;
        },                        intents);
    } else {
        const topScoringIntent = luisResult.topScoringIntent;
        intents[(topScoringIntent).intent] = topScoringIntent.score;
    }
    return intents;
}

private getEntitiesAndMetadata(
  entities: Entity[], 
  compositeEntities:  CompositeEntity[] | undefined, 
  verbose: boolean): any {
    let entitiesAndMetadata: any = verbose ? {$instance: {} } : {};
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
              this.getEntityMetadata(entity));
        }
    });

    return entitiesAndMetadata;
}

private getEntityValue(entity: Entity): any {
    if (entity.type.startsWith('builtin.datetimeV2.') && 
        entity.resolution && entity.resolution.values && entity.resolution.values.length) {
        return entity.resolution.values[0].timex;
    } else if (entity.resolution) {
        if (entity.type.startsWith('builtin.number')) {
          return Number(entity.resolution.value);
        } else {
            return Object.keys(entity.resolution).length > 1 ? 
                    entity.resolution : 
                    entity.resolution.value ? 
                        entity.resolution.value : 
                        entity.resolution.values;
        }
    } else {
      return entity.entity;
    }
}

private getEntityMetadata(entity: Entity): any {
    return {
        startIndex: entity.startIndex,
        endIndex: entity.endIndex,
        text: entity.entity,
        score: entity.score
    };
}

private getNormalizedEntityType(entity: Entity): string {
    return entity.type.replace(/\./g, '_');
}

private populateCompositeEntity(
  compositeEntity: CompositeEntity, 
  entities: Entity[], entitiesAndMetadata: any, 
  verbose: boolean): Entity[] {
    let childrenEntites: any = verbose ? { $instance: {} } : {};
    let childrenEntitiesMetadata: any = {};
    
    // This is now implemented as O(n^2) search and can be reduced to O(2n) using a map as an optimization if n grows
    let compositeEntityMetadata: Entity | undefined = entities.find(entity => {
        // For now we are matching by value, which can be ambiguous if the same composite entity 
        // shows up with the same text multiple times within an utterance, but this is just a 
        // stop gap solution till the indices are included in composite entities
        return entity.type === compositeEntity.parentType && entity.entity === compositeEntity.value;
    });

    let filteredEntities: Entity[] = [];
    if (verbose && compositeEntityMetadata) {
        childrenEntitiesMetadata = this.getEntityMetadata(compositeEntityMetadata);
        childrenEntitiesMetadata.$instance = {};
    }

    // This is now implemented as O(n*k) search and can be reduced to O(n + k) 
    // using a map as an optimization if n or k grow
    let coveredSet = new Set();
    compositeEntity.children.forEach(childEntity => {
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            if (!coveredSet.has(i) &&
                childEntity.type === entity.type && 
                compositeEntityMetadata && 
                entity.startIndex !== undefined && 
                compositeEntityMetadata.startIndex !== undefined && 
                entity.startIndex >= compositeEntityMetadata.startIndex && 
                entity.endIndex !== undefined && 
                compositeEntityMetadata.endIndex !== undefined && 
                entity.endIndex <= compositeEntityMetadata.endIndex) {

                // Add to the set to ensure that we don't consider the same child entity more than once per composite
                coveredSet.add(i);
                this.addProperty(childrenEntites, this.getNormalizedEntityType(entity), this.getEntityValue(entity));

                if (verbose) {
                  this.addProperty(
                    childrenEntites.$instance, 
                    this.getNormalizedEntityType(entity), 
                    this.getEntityMetadata(entity));
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