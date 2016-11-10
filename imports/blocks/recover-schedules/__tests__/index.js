import Meteor from "meteor/meteor";
import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";
import { reset, startBuffering } from "aphrodite/lib/inject";

import { RecoverSchedules } from "../";

beforeEach(() => {
  reset();
  startBuffering();
})
afterEach(() => {
  // Meteor.call.mockClear();
  reset();
});

describe("RecoverSchedules", () => {
  const sampleProps = {
    dispatch: jest.fn(),
    give: {
      recoverableSchedules: {},
      reminderDate: "20200101",
    },
  };

  it("should be default if nothing is passed", () => {
    const tree = shallow(
      <RecoverSchedules {...sampleProps} />
    );
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  it("has a back method", () => {
    const wrapper = shallow(
      <RecoverSchedules {...sampleProps} />
    );
    const component = wrapper.instance();
    expect(component.back).toBeTruthy();
  });

  it("calls the back method", () => {
    const wrapper = shallow(
      <RecoverSchedules {...sampleProps} />
    );
    const component = wrapper.instance();
    const mockedEvent = {
      preventDefault: jest.fn(),
    };
    component.back(mockedEvent);
    expect(mockedEvent.preventDefault).toBeCalled();
  });

  it("has a close method", () => {
    const wrapper = shallow(
      <RecoverSchedules {...sampleProps} />
    );
    const component = wrapper.instance();
    expect(component.close).toBeTruthy();
  });

  it("calls the close method", () => {
    const wrapper = shallow(
      <RecoverSchedules {...sampleProps} />
    );
    const component = wrapper.instance();
    component.close = jest.fn();
    component.close();
    expect(component.close).toBeCalled();
  });

  it("has an onRemind method", () => {
    const wrapper = shallow(
      <RecoverSchedules {...sampleProps} />
    );
    const component = wrapper.instance();
    expect(component.onRemind).toBeTruthy();
  });
});