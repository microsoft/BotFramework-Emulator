//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//


export const clearCloseIcon = (className: string, size: number) => {
    return `
<svg class="${className}" width="${size}px" height="${size}px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="x-large">
            <g id="refresh">
                <polygon id="Shape" points="0 0 24 0 24 24 0 24"></polygon>
                <g id="close" transform="translate(6.000000, 6.000000)" stroke="#FFFFFF" stroke-width="2">
                    <path d="M0.486851205,0.486851205 L11.8005597,11.8005597" id="Line"></path>
                    <path d="M0.486851205,0.486851205 L11.8005597,11.8005597" id="Line" transform="translate(6.143705, 6.143705) scale(-1, 1) translate(-6.143705, -6.143705) "></path>
                </g>
            </g>
        </g>
    </g>
</svg>
    `;
}

export const hamburgerIcon = (className: string, size: number) => {
    return `
<svg class="${className}" width="${size}px" height="${size}px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="menu">
            <g>
                <rect id="Rectangle-2" x="0" y="0" width="24" height="24"></rect>
                <path d="M10,6 C10,7.1045695 10.8954305,8 12,8 C13.1045695,8 14,7.1045695 14,6 C14,4.8954305 13.1045695,4 12,4 C10.8954305,4 10,4.8954305 10,6 Z M10,12 C10,13.1045695 10.8954305,14 12,14 C13.1045695,14 14,13.1045695 14,12 C14,10.8954305 13.1045695,10 12,10 C10.8954305,10 10,10.8954305 10,12 Z M10,18 C10,19.1045695 10.8954305,20 12,20 C13.1045695,20 14,19.1045695 14,18 C14,16.8954305 13.1045695,16 12,16 C10.8954305,16 10,16.8954305 10,18 Z" id="Combined-Shape" fill="#FFFFFF"></path>
            </g>
        </g>
    </g>
</svg>
    `;
}

export const reloadIcon = (className: string, size: number) => {
    return `
<svg class="${className}" width="${size}px" height="${size}px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="refresh">
            <g id="Shape">
                <polygon points="0 0 24 0 24 24 0 24"></polygon>
                <path d="M11.500938,6 C7.91020633,6 5.01,8.90833016 5.01,12.4990618 C5.01,16.0897934 7.91020633,18.9981236 11.500938,18.9981236 C14.5311255,18.9981236 17.0576358,16.9265476 17.7806564,14.1238272 L16.0909004,14.1238272 C15.4247465,16.016679 13.6212569,17.3733581 11.500938,17.3733581 C8.81195115,17.3733581 6.62664162,15.1880486 6.62664162,12.4990618 C6.62664162,9.81007498 8.81195115,7.62476545 11.500938,7.62476545 C12.8494933,7.62476545 14.0518197,8.18530953 14.9291931,9.0708067 L12.3133207,11.6866791 L17.9999998,11.6866791 L17.9999998,6 L16.0909004,7.9090994 C14.9129454,6.73114445 13.2963038,6 11.500938,6 Z" fill="#FFFFFF"></path>
            </g>
        </g>
    </g>
</svg>
    `;
}

export const botFrameworkIconEmbossed = (className: string, size: number) => {
    return `
<svg class="${className}" width="${size}px" height="${size}px" viewBox="0 0 158 158" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <ellipse id="path-1" cx="40.3301887" cy="34.7878788" rx="4.66981132" ry="4.66666667"></ellipse>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-2">
            <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.09 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
        </filter>
        <polygon id="path-3" points="63.4092287 32.1588326 60.7075472 34.8586949 63.4092287 37.5585571 95.6259173 69.753551 101.02928 64.3538265 71.4220495 34.8586949 100.993095 5.39972451 95.5897317 0"></polygon>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-4">
            <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.09 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
        </filter>
        <polygon id="path-5" points="2.70168157 32.1588326 0 34.8586949 2.70168157 37.5585571 34.9183701 69.753551 40.3217333 64.3538265 10.7145024 34.8586949 40.2855477 5.39972451 34.8821846 0"></polygon>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-6">
            <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.09 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
        </filter>
        <ellipse id="path-7" cx="61.1320755" cy="34.7878788" rx="4.66981132" ry="4.66666667"></ellipse>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-8">
            <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.09 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
        </filter>
        <path d="M156,78 C156,34.9217895 121.07821,0 78,0 C34.9217895,0 0,34.9217895 0,78 C0,121.07821 34.9217895,156 78,156 C121.07821,156 156,121.07821 156,78 Z M8,78 C8,39.3400675 39.3400675,8 78,8 C116.659932,8 148,39.3400675 148,78 C148,116.659932 116.659932,148 78,148 C39.3400675,148 8,116.659932 8,78 Z" id="path-9"></path>
        <filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="filter-10">
            <feOffset dx="0" dy="1" in="SourceAlpha" result="shadowOffsetInner1"></feOffset>
            <feComposite in="shadowOffsetInner1" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowInnerInner1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.09 0" type="matrix" in="shadowInnerInner1"></feColorMatrix>
        </filter>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="empty_chat">
            <g id="Group" transform="translate(1.000000, 1.000000)">
                <g id="botty_mcbot" transform="translate(27.000000, 43.000000)">
                    <g id="Group-19">
                        <g id="Oval-4">
                            <use fill-opacity="0.548403533" fill="#E3E5E7" fill-rule="evenodd" xlink:href="#path-1"></use>
                            <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                        </g>
                        <g id="Path-2" transform="translate(80.868414, 34.876775) scale(-1, 1) translate(-80.868414, -34.876775) ">
                            <use fill-opacity="0.548403533" fill="#E3E5E7" fill-rule="evenodd" xlink:href="#path-3"></use>
                            <use fill="black" fill-opacity="1" filter="url(#filter-4)" xlink:href="#path-3"></use>
                        </g>
                        <g id="Path-2">
                            <use fill-opacity="0.548403533" fill="#E3E5E7" fill-rule="evenodd" xlink:href="#path-5"></use>
                            <use fill="black" fill-opacity="1" filter="url(#filter-6)" xlink:href="#path-5"></use>
                        </g>
                        <g id="Oval-4" transform="translate(61.132075, 34.787879) scale(-1, 1) translate(-61.132075, -34.787879) ">
                            <use fill-opacity="0.548403533" fill="#E3E5E7" fill-rule="evenodd" xlink:href="#path-7"></use>
                            <use fill="black" fill-opacity="1" filter="url(#filter-8)" xlink:href="#path-7"></use>
                        </g>
                    </g>
                </g>
                <g id="Oval">
                    <use fill-opacity="0.548403533" fill="#E3E5E7" fill-rule="evenodd" xlink:href="#path-9"></use>
                    <use fill="black" fill-opacity="1" filter="url(#filter-10)" xlink:href="#path-9"></use>
                </g>
            </g>
        </g>
    </g>
</svg>
    `;
}


export const botFrameworkIcon = (className: string, size: number) => {
    return `
<svg class="${className}" width="${size}px" height="${size}px" viewBox="0 0 244 244" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
   <g id="Layer_2" data-name="Layer 2">
      <g id="Layer_1-2" data-name="Layer 1">
         <path d="M122,15.25A106.75,106.75,0,1,1,15.25,122h0A106.87,106.87,0,0,1,122,15.25M122,0A122,122,0,1,0,244,122,122,122,0,0,0,122,0Z"/>
         <circle cx="102.93" cy="122" r="11.43"/>
         <circle cx="141.06" cy="122" r="11.43"/>
         <path d="M93.73,188.39l-61-61a7.63,7.63,0,0,1,0-10.78l0,0,61-61,10.82,10.82L48.91,122l55.61,55.61Z"/>
         <path d="M150.27,188.39l-10.82-10.82L195.09,122,139.48,66.39l10.82-10.82,61,61a7.62,7.62,0,0,1,0,10.78l0,0Z"/>
      </g>
   </g>
</svg>
    `;
}

export const removeIcon = (className: string, size: number) => {
    return `
<svg class="${className}" width="${size}px" height="${size}px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1">
        <g id="x-large">
            <g id="refresh">
                <g id="close" transform="translate(6.000000, 6.000000)" stroke-width="1">
                    <path d="M0.486851205,0.486851205 L11.8005597,11.8005597" id="Line"></path>
                    <path d="M0.486851205,0.486851205 L11.8005597,11.8005597" id="Line" transform="translate(6.143705, 6.143705) scale(-1, 1) translate(-6.143705, -6.143705) "></path>
                </g>
            </g>
        </g>
    </g>
</svg>
    `;
}
