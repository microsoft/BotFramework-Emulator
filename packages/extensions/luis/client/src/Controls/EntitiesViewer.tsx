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

  '& #entities': {
    paddingTop: '8px'
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
    let filteredEntityKeys = Object.keys(this.props.entities || {}).filter(entityKey => { 
      return entityKey !== INSTANCE_KEY; 
    });
    if (filteredEntityKeys.length > 0) {
      entities = filteredEntityKeys.map(entityKey => {
        let entity: EntityInfo = {
          name: entityKey,
          value: this.props.entities[entityKey]
        };
        return <EntityViewer key={entityKey} entity={entity} />;
      });
    } else {
      entities = [<span key="no-entities">No Entities</span>];
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
