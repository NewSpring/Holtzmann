import { Component } from "react";
import { mount, shallow } from "enzyme";
import { mountToJson, shallowToJson } from "enzyme-to-json";
// import ReactTestUtils from 'react-addons-test-utils' // ES6

import { createStore } from "redux";

import { Provider } from "react-redux";
import { reset, startBuffering } from "aphrodite/lib/inject";
// import { getSingleSpecWrapper } from "../../../../util/tests/data-spec.js";

import Layout from "../Layout";

import Subfund from "../Subfund";

jest.mock("../Subfund", () => jest.fn(() => <div />));
jest.mock("../../checkout-buttons", () => jest.fn(() => <div />));

const additionalAccounts = [
  { value: 1, label: "TEST 1" },
  { value: 2, label: "TEST 2" },
  { value: 3, label: "TEST 3" },
];

const generateComponent = (additionalProps = {}) => {
  const store = createStore(jest.fn());
  const defaultProps = {
    accounts: [
      { value: "test" }
    ],
    monentize: jest.fn(),
    preFill: () => {},
  };
  return (
    <Layout {...defaultProps} {...additionalProps} />
  );
};

beforeEach(() => {
  reset();
  startBuffering();
});

afterEach(() => {
  reset();
});

it("should render with minimal props", () => {
  const component = shallow(generateComponent());
  expect(shallowToJson(component)).toMatchSnapshot();
});

// XXX this will work fully when the stuff isn't mocked'
it("should handle multiple accounts", () => {
  // Mock the subfund lifecycle where it updates the parent component
  // this lets it set the second input on load
  // XXX it would be nice if we could do this without the immediate rerender for SSR
  class LocalSubFund extends Component {
    state = {
      amount: null
    }
    componentWillMount() {
      if (this.props.primary) {
        this.props.update(this.props.instance, this.props.accounts[0].value, this.state.amount);
      }
    }
    render() {
      return null;
    }
  }
  Subfund.mockImplementationOnce((props) => <LocalSubFund {...props} />);
  const component = mount(generateComponent({accounts: additionalAccounts}));
  expect(mountToJson(component)).toMatchSnapshot();
});

// it ("", () => {});
// it ("", () => {});
// it ("", () => {});

// describe ("Layout > Update", () => {});
// describe ("Layout > Remove", () => {});