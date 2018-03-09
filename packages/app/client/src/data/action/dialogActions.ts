export const SET_SHOWING = 'DIALOG/SET_SHOWING';

export function setShowing(showing) {
  return {
    type: SET_SHOWING,
    payload: {
      showing
    }
  };
}
