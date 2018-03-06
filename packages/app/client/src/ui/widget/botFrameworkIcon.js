import React from 'react';

export default props =>
  <svg className={ props.className } width={ props.size + 'px' } height={ props.size + 'px' } viewBox="0 0 244 244" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
    <g id="Layer_2" data-name="Layer 2">
        <g id="Layer_1-2" data-name="Layer 1">
          <path d="M122,15.25A106.75,106.75,0,1,1,15.25,122h0A106.87,106.87,0,0,1,122,15.25M122,0A122,122,0,1,0,244,122,122,122,0,0,0,122,0Z" style={{ fill: props.color, fillOpacity: 1 }} />
          <circle cx="102.93" cy="122" r="11.43" style={{ fill: props.color, fillOpacity: 1 }} />
          <circle cx="141.06" cy="122" r="11.43" style={{ fill: props.color, fillOpacity: 1 }} />
          <path d="M93.73,188.39l-61-61a7.63,7.63,0,0,1,0-10.78l0,0,61-61,10.82,10.82L48.91,122l55.61,55.61Z" style={{ fill: props.color, fillOpacity: 1 }} />
          <path d="M150.27,188.39l-10.82-10.82L195.09,122,139.48,66.39l10.82-10.82,61,61a7.62,7.62,0,0,1,0,10.78l0,0Z" style={{ fill: props.color, fillOpacity: 1 }} />
        </g>
    </g>
  </svg>;
