import * as React from 'react';
import { Component } from 'react';

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
        return (
            <div>
                <div>Entities</div>
            </div>
        );
    }
}

export default EntitiesViewer;
