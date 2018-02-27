import { SHADOW_COLOR } from './colors';

const BLUR_RADIUS = '8px';
const SPREAD_RADIUS = '-2px'

export const INSET_TOP = `inset 0px 4px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
export const INSET_BOTTOM = `inset 0px -4px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
export const INSET_LEFT = `inset 4px 0px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
export const INSET_RIGHT = `inset -4px 0px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
