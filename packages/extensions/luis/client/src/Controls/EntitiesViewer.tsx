import * as React from 'react';
import { Component } from 'react';
import { EntityViewer, EntityInfo } from './EntityViewer';
import { css } from 'glamor';

const INSTANCE_KEY = '$instance';

const ENTITIES_VIWER_CSS = css({
  paddingTop: '32px',

  '& #header': {
    fontWeight: 'bold'
  },

  '$ #entities': {
    paddingTop: '16px'
  }
});

interface EntitiesViewerState {

}

interface EntitiesViewerProps {
  entities: any;
}

class EntitiesViewer extends Component<EntitiesViewerProps, EntitiesViewerState> {

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    let entities: any[];
    if (this.props.entities) {
      entities = Object.keys(this.props.entities).filter(entityKey => { 
        return entityKey !== INSTANCE_KEY; 
      }).map(entityKey => {
        let entity: EntityInfo = {
          name: entityKey,
          value: this.props.entities[entityKey]
        };
        return <EntityViewer key={entityKey} entity={entity} />;
      });
    } else {
      entities = [];
    }
    return (
      <div {...ENTITIES_VIWER_CSS}>
        <div id="header">Entities</div>
        <div id="entities">
          {entities}
        </div>
      </div>
    );
  }
}

export default EntitiesViewer;
