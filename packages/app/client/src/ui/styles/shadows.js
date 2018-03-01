import { SHADOW_COLOR } from './colors';

const BLUR_RADIUS = '6px';
const SPREAD_RADIUS = '-3px'

export const INSET_TOP = `inset 0px 3px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
export const INSET_BOTTOM = `inset 0px -3px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
export const INSET_LEFT = `inset 3px 0px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
export const INSET_RIGHT = `inset -3px 0px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${SHADOW_COLOR}`;
