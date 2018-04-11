import * as React from 'react';
import { Component } from 'react';

interface EntityInfo {
  name: string;
  value: any;
}

interface EntityViewerState {

}

interface EntityViwerProps {
  entity: any;
}

class EntityViewer extends Component<EntityViwerProps, EntityViewerState> {

  static renderEntityValue(entityValue: any): string {
    if (Array.isArray(entityValue)) {
      return entityValue.join(', ');
    }

    return entityValue;
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    return (
      <div>
        <span>{this.props.entity.name}</span>
        <span> --> </span>
        <span>{EntityViewer.renderEntityValue(this.props.entity.value)}</span>
      </div>
    );
  }
}

export {EntityViewer, EntityInfo};
