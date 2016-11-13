// @flow
import { Component } from "react";

import Validate from "../../../../util/validate";

import Layout from "./Layout";

type IPayment = {
  save: Function,
  data: Object,
  savedAccount: Object,
  header?: React$Element<any>,
  children?: React$Element<any>,
  toggles?: string[],
  transactionType: string,
  schedules: Object,
  back: Function,
  next: Function,
}

type IPaymentState = {
  save: boolean,
};

export default class Payment extends Component {
  props: IPayment;
  state: IPaymentState;

  state = {
    save: true,
  }

  savePayment = (): void => {
    this.setState(({ save }) => ({ save: !save }));

    if (this.state.save) {
      this.props.save({ payment: { name: null } });
    }
  }

  saveName = (value: string): boolean => {
    if (value.length > 0) {
      this.props.save({ payment: { name: value } });
    }

    return (value.length > 0);
  }

  validate = (value: string, target: HTMLElement): boolean => {
    const { id } = target;
    // special case for intial repaint
    if ((id === "cardNumber" || id === "routingNumber") && !value) return true;

    let isValid = false;
    const notEmpty = (inputVal) => (inputVal.length > 0);
    const validationMap = {
      accountNumber: notEmpty,
      routingNumber: notEmpty,
      accountType: notEmpty,
      accountName: notEmpty,
      cardNumber: Validate.isCreditCard,
      expiration: notEmpty,
      ccv: Validate.isCCV,
    };

    isValid = validationMap[id](value);

    return isValid;
  }

  saveData = (value: string, target: HTMLElement) => {
    const { id } = target;

    const isValid = this.validate(value, target);

    if (isValid) {
      this.props.save({ payment: { [id]: value } });
    }
  }

  // XXX move to layout, but changes to input are needed
  formatExp = (s: string, target: HTMLInputElement): string => {
    const save = (adjusted) => {
      this.saveData(adjusted, target);
      return adjusted;
    };

    let current = this.props.data.payment.expiration;
    if (!current) current = "";

    const str = `${s}`;

    if (str.length > 5) return save(str.slice(0, 5));

    const copy = str;
    const lastNumber = copy.slice(-1);
    const currentLastNumber = current.slice(-1);

    if (lastNumber === "/" && str.length === 1) {
      return save(`0${str}/`);
    }

    if (lastNumber === "/" && str.length === 2 && currentLastNumber !== "/") {
      return save(`${str}/`);
    }

    if (str.length === 2 && lastNumber !== "/" && currentLastNumber !== "/") {
      return save(`${str}/`);
    }

    if (str.length === 4 && (lastNumber === "/")) {
      return save(str.slice(0, 3));
    }

    return save(str);
  }

  toggle = (): void => {
    let type = "ach";
    if (this.props.data.payment.type === type) {
      type = "cc";
    }

    this.props.save({ payment: { type } });
  }

  render() {
    return (
      <Layout
        formatExp={this.formatExp}
        saveData={this.saveData}
        saveName={this.saveName}
        savePayment={this.savePayment}
        toggle={this.toggle}
        validate={this.validate}

        shouldSaveState={this.state.save}

        back={this.props.back}
        header={this.props.header}
        next={this.props.next}
        payment={this.props.data.payment}
        savedAccount={this.props.savedAccount}
        schedules={this.props.schedules}
        toggles={this.props.toggles}
        transactionType={this.props.transactionType}
      >
        {this.props.children}
      </Layout>
    );
  }
}