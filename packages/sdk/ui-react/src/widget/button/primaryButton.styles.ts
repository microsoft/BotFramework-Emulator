import { IButtonStyles } from 'office-ui-fabric-react';

/* fabric Primary Button

<button type="button" class="ms-Button ms-Button--primary">
  <div class="ms-Button-flexContainer flexContainer-78">
    <div class="ms-Button-textContainer textContainer-79">
      <div class="ms-Button-label label-81" id="id__1">
        Open Bot
      </div>
    </div>
  </div>
</button>
*/
export const primaryButtonStyles: IButtonStyles = {
  /**
   * Style for the root element in the default enabled, non-toggled state.
   */
  root: {
    minWidth: '104px',
    minHeight: '21px',
    fontSize: '12px',
    backgroundColor: 'var(--p-button-bg)',
    selectors: {
      '::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
        border: 'var(--p-button-border)',
        outline: 'none'
      }
    }
  },
  /**
   * Style override for the root element in a checked state, layered on top of the root style.
   */
  // rootChecked: {},
  /**
   * Style override for the root element in a disabled state, layered on top of the root style.
   */
  rootDisabled: {
    backgroundColor: `var(--p-button-bg-disabled)`,
    selectors: {
      '::after': {
        border: 'var(--p-button-border-disabled)',
        opacity: 'var(--p-button-opacity-disabled)',
        outline: 'none'
      }
    }
  },
  /**
   * Style override applied to the root on hover in the default, enabled, non-toggled state.
   */
  rootHovered: {
    backgroundColor: 'var(--p-button-bg-hover)',
    selectors: {
      '::after': {
        content: '""',
        border: 'var(--p-button-border-hover)',
      }
    }
  },
  /**
   * Style override applied to the root on hover in the default, enabled, non-toggled state.
   */
  rootFocused: {
    backgroundColor: 'var(--p-button-bg-focus)',
    selectors: {
      '::after': {
        border: 'var(--p-button-border-focus)',
        outline: 'none'
      }
    }
  },
  /**
   * Style override applied to the root on pressed in the default, enabled, non-toggled state.
   */
  rootPressed: {
    backgroundColor: 'var(--p-button-bg-active)',
    selectors: {
      '::after': {
        content: '',
        border: 'var(--p-button-border-active)',
        outline: 'none'
      }
    }
  },
  /**
   * Style override applied to the root on when menu is expanded in the default, enabled, non-toggled state.
   */
  // rootExpanded: {},
  /**
   * Style override applied to the root on hover in a checked, enabled state
   */
  // rootCheckedHovered: {},
  /**
   * Style override applied to the root on pressed in a checked, enabled state
   */
  // rootCheckedPressed: {},
  /**
   * Style override applied to the root on hover in a checked, disabled state
   */
  // rootCheckedDisabled: {},
  /**
   * Style override applied to the root on hover in a expanded state on hover
   */
  // rootExpandedHovered: {},
  /**
   * Style for the flexbox container within the root element.
   */
  // flexContainer: {},
  /**
   * Style for the text container within the flexbox container element (and contains the text and description).
   */
  // textContainer: {},
  /**
   * Style for the icon on the near side of the label.
   */
  // icon: {},
  /**
   * Style for the icon on the near side of the label on hover.
   */
  // iconHovered: {},
  /**
   * Style for the icon on the near side of the label when pressed.
   */
  // iconPressed: {},
  /**
   * Style for the icon on the near side of the label when expanded.
   */
  // iconExpanded: {},
  /**
   * Style for the icon on the near side of the label when expanded and hovered.
   */
  // iconExpandedHovered: {},
  /**
   * Style override for the icon when the button is disabled.
   */
  // iconDisabled: {},
  /**
   * Style override for the icon when the button is checked.
   */
  // iconChecked: {},
  /**
   * Style for the text content of the button.
   */
  label: {
    color: 'var(--p-button-color)'
  },
  /**
   * Style override for the text content when the button is disabled.
   */
  labelDisabled: {
    color: 'var(--p-button-color-disabled)'
  },
  /**
   * Style override for the text content when the button is checked.
   */
  // labelChecked: {},
  /**
   * Style for the menu chevron.
   */
  // menuIcon: {},
  /**
   * Style for the menu chevron on hover.
   */
  // menuIconHovered: {},
  /**
   * Style for the menu chevron when pressed.
   */
  // menuIconPressed: {},
  /**
   * Style for the menu chevron when expanded.
   */
  // menuIconExpanded: {},
  /**
   * Style for the menu chevron when expanded and hovered.
   */
  // menuIconExpandedHovered: {},
  /**
   * Style override for the menu chevron when the button is disabled.
   */
  // menuIconDisabled: {},
  /**
   * Style override for the menu chevron when the button is checked.
   */
  // menuIconChecked: {},
  /**
   * Style for the description text if applicable (for compound buttons.)
   */
  // description: {},
  /**
   * Style for the description text if applicable (for compound buttons.)
   */
  // secondaryText: {},
  /**
   * Style override for the description text when the button is hovered.
   */
  // descriptionHovered: {},
  /**
   * Style for the description text when the button is pressed.
   */
  // descriptionPressed: {},
  /**
   * Style override for the description text when the button is disabled.
   */
  // descriptionDisabled: {},
  /**
   * Style override for the description text when the button is checked.
   */
  // descriptionChecked: {},
  /**
   * Style override for the screen reader text.
   */
  // screenReaderText: {},
  /**
   * Style override for the container div around a SplitButton element
   */
  // splitButtonContainer: {},
  /**
   * Style for container div around a SplitButton element when the button is hovered.
   */
  // splitButtonContainerHovered: {},
  /**
   * Style for container div around a SplitButton element when the button is focused.
   */
  // splitButtonContainerFocused: {},
  /**
   * Style for container div around a SplitButton element when the button is checked.
   */
  // splitButtonContainerChecked: {},
  /**
   * Style for container div around a SplitButton element when the button is checked and hovered.
   */
  // splitButtonContainerCheckedHovered: {},
  /**
   * Style override for the container div around a SplitButton element in a disabled state
   */
  // splitButtonContainerDisabled: {},
  /**
   * Style override for the divider element that appears between the button and menu button
   * for a split button.
   */
  // splitButtonDivider: {},
  /**
   * Style override for the SplitButton menu button
   */
  // splitButtonMenuButton: {},
  /**
   * Style override for the SplitButton menu button element in a disabled state.
   */
  // splitButtonMenuButtonDisabled: {},
  /**
   * Style override for the SplitButton menu button element in a checked state
   */
  // splitButtonMenuButtonChecked: {},
  /**
   * Style override for the SplitButton menu button element in an expanded state
   */
  // splitButtonMenuButtonExpanded: {},
  /**
   * Style override for the SplitButton menu icon element
   */
  // splitButtonMenuIcon: {},
  /**
   * Style override for the SplitButton menu icon element in a disabled state
   */
  // splitButtonMenuIconDisabled: {},
  /**
   * Style override for the SplitButton FlexContainer.
   */
  // splitButtonFlexContainer: {},
};
