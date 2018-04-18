import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';

const InstanceKey = '$instance';

const CSS = css({
  display: 'block',

  '& #entityName': {
    display: 'inline-block',
    overflow: 'hidden'
  },

  '& #arrow': {
    display: 'inline-block',
    overflow: 'hidden'
  },

  '& #entityValue': {
    display: 'inline-block',
    maxWidth: '150px',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  }
});

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

  static renderEntityValueObject(entityValue: object): string {
    if (InstanceKey in entityValue) {
      delete entityValue[InstanceKey];
    }
    return JSON.stringify(entityValue);
  }
  static renderEntityValue(entityValue: any): string {
    if (Array.isArray(entityValue)) {
      entityValue = EntityViewer.flattenEntityValue(entityValue);
    }

    if (Array.isArray(entityValue)) {
      if ( typeof entityValue[0] === 'object') {
        entityValue = entityValue.map(ev => EntityViewer.renderEntityValueObject(ev));
      }
      return entityValue.join(', ');
    }

    if ( typeof entityValue === 'object' ) {
      return EntityViewer.renderEntityValueObject(entityValue);
    }

    // primitive
    return entityValue;
  }

  static flattenEntityValue(entityValueArr: any[]) {
    return [].concat.apply([], entityValueArr);
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {};
  }

  render() {
    return (
      <div {...CSS}>
        <div id="entityName">{this.props.entity.name}</div>
        <div id="arrow">&nbsp; -->&nbsp; </div>
        <div id="entityValue">{EntityViewer.renderEntityValue(this.props.entity.value)}</div>
      </div>
    );
  }
}

export {EntityViewer, EntityInfo};
