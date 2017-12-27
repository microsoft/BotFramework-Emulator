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
import * as React from 'react';
import * as Constants from '../constants';

interface ISelectorItemProps {
    class: any;
    item: any;
    select: (item: any) => void;
    remove?: (item: any) => void;
}

class SelectorItem extends React.Component<ISelectorItemProps, {}> {
    constructor(props) {
        super(props);

        this.select = this.select.bind(this);
        this.remove = this.remove.bind(this);
    }

    select(e) {
        this.props.select(this.props.item);
    }

    remove(e) {
        e.stopPropagation();
        if (this.props.remove) {
            this.props.remove(this.props.item);
        }
        console.log('remove');
    }

    render() {
        let renderedItem = React.createElement(this.props.class, { item: this.props.item });
        let removeButton;

        if (this.props.remove) {
            removeButton = (<div className='remove-item' onClick={this.remove} dangerouslySetInnerHTML={{ __html: Constants.removeIcon('', 20) }}></div>);
        }

        return (
            <div className='selector-item-container'>
                <div className='selector-item' onClick={this.select}>{renderedItem}</div>
                {removeButton}
            </div>
        );
    }
}

export class SelectorComponent<TItem> extends React.Component<{
    getIsVisible: () => boolean,
    setIsVisible: (isVisible: boolean) => void,
    items: TItem[],
    placeholder?: string,
    getSelectedItem: () => TItem,
    selectItem: (TItem) => void,
    addItemLabel?: string,
    onClickAddItem?: () => void,
    onClickRemoveItem?: (TItem) => void,
    classes?: string
}, {}> {
    private top: string;
    private left: string;
    private width: string;
    private itemComponentType: any;

    constructor(props, itemComponentType?) {
        super(props);
        this.itemComponentType = itemComponentType;

        this.toggle = this.toggle.bind(this);
        this.select = this.select.bind(this);
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
    }

    select(item: TItem) {
        this.props.selectItem(item);
        this.props.setIsVisible(false);
    }

    addItem() {
        this.props.setIsVisible(false);
        this.props.onClickAddItem();
    }

    removeItem(item: TItem) {
        this.props.onClickRemoveItem(item);
    }

    toggle(evt) {
        let isVisible = this.props.getIsVisible();
        if (isVisible || this.props.addItemLabel || (this.props.items && this.props.items.length > 0)) {
            let target = evt.target as HTMLElement;
            let selector = target.closest('.checkout-selector') as HTMLElement;
            evt.stopPropagation();
            this.props.setIsVisible(!isVisible);

            this.width = selector.offsetWidth + 'px';
            this.left = selector.offsetLeft + 'px';
            this.top = (selector.offsetHeight + selector.offsetTop) + 'px';
        }
    }

    render() {
        let contents = undefined;
        if (this.props.getIsVisible()) {
            let selectorList = [];
            let keyIdx = 0;
            if (this.props.items) {
                this.props.items.forEach(ri => {
                    selectorList.push(<SelectorItem
                        key={keyIdx}
                        class={this.itemComponentType}
                        item={ri}
                        select={(item) => { this.select(item); }}
                        remove={(this.props.onClickRemoveItem ? (item) => { this.removeItem(item); } : undefined) }
                        />);
                    keyIdx++;
                });
            }

            if (this.props.addItemLabel && this.props.onClickAddItem) {
                selectorList.push(
                    <div className='selector-item' onClick={this.addItem} key='addItem'>
                        <div className='add-item'>{this.props.addItemLabel}</div>
                    </div>);
            }

            if (selectorList.length > 0) {
                contents = (
                    <div className='selector-items grow' style={{top: this.top, width: this.width, left: this.left}}>
                        {selectorList}
                    </div>);
            }
        }

        let labelElement = undefined;
        let selectedItem = this.props.getSelectedItem();
        if (selectedItem) {
            labelElement = React.createElement(this.itemComponentType, { item: selectedItem });
        } else if (this.props.placeholder) {
            labelElement = (<div className='placeholder-text'>{this.props.placeholder}</div>)
        }

        return (<div className={'checkout-selector ' + (this.props.classes ? this.props.classes : '')} onClick={this.toggle}>
                    <div className='selected-item-label-container'>
                        <div className='selected-item-label'>{labelElement}</div>
                        <div className='down-chevron'>\/</div>
                    </div>
                    {contents}
                </div>);
    }
}