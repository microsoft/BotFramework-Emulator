import { Dialog, DialogFooter, PrimaryButton } from "@bfemulator/ui-react";
import * as React from "react";
import { Component } from "react";

import * as dialogStyles from "../dialogStyles.scss";

import * as styles from "./progressIndicator.scss";

export interface ProgressIndicatorProps extends ProgressIndicatorState {
  cancel: () => void;
  close: () => void;
}

export interface ProgressIndicatorState {
  label: string;
  progress: number;
}

export class ProgressIndicator extends Component<
  ProgressIndicatorProps,
  ProgressIndicatorState
> {
  private hr: HTMLElement;

  public render() {
    if (this.hr) {
      this.hr.style.setProperty(
        "--progress-percentage",
        `${this.props.progress}%`
      );
    }
    return (
      <Dialog cancel={this.props.close} className={dialogStyles.dialogMedium}>
        <p>{this.props.label}</p>
        <hr className={styles.progressIndicator} ref={this.hrRef} />
        <DialogFooter>
          <PrimaryButton text="Dismiss" onClick={this.props.cancel} />
        </DialogFooter>
      </Dialog>
    );
  }

  private hrRef = (hr: HTMLElement): void => {
    this.hr = hr;
  };
}
