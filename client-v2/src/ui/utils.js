import React from 'react';

export function filterChildren(children, predicate) {
    return React.Children.map(children, child => predicate(child) ? child : false);
}
