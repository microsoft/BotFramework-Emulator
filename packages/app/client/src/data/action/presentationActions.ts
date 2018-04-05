export type PresentationAction = {
  type: 'PRESENTATION/ENABLE',
  payload: {}
} | {
  type: 'PRESENTATION/DISABLE',
  payload: {}
};

export const ENABLE = 'PRESENTATION/ENABLE';
export const DISABLE = 'PRESENTATION/DISABLE';

export function enable(): PresentationAction {
  return {
    type: 'PRESENTATION/ENABLE',
    payload: {}
  };
}

export function disable(): PresentationAction {
  return {
    type: 'PRESENTATION/DISABLE',
    payload: {}
  };
}
