export const SHOW = 'EXPLORER/SHOW';

export function show(show: boolean) {
  return {
    type: SHOW,
    payload: {
      show
    }
  };
}
