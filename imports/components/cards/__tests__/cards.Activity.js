import { mount, shallow } from "enzyme";
import moment from "moment";
import Activity from "../cards.Activity";

describe("Activity", () => {

  const generateComponent = (additionalProps = {}) => {
    const defaultProps = {
      status: "success",
      date: moment("2016-12-25"),
      message: "You did something awesome and I've never been more proud.",
      linkText: "Click This Link",
      linkUrl: "https://my.newspring.cc/give/now",
    };

    return (
      <Activity {...defaultProps} {...additionalProps} />
    );
  };

  it("should render with the default set of props", () => {
    const component = shallow(generateComponent());
    expect(component).toMatchSnapshot();
  });

  it("should render the warning status component", () => {
    const component = shallow(generateComponent({ status: "warning" }));
    expect(component).toMatchSnapshot();
  });

  it("should render the failed status component", () => {
    const component = shallow(generateComponent({ status: "failed" }));
    expect(component).toMatchSnapshot();
  });
});
