import { shallow } from "enzyme";
import { print } from "graphql-tag/printer";
import {
  DiscoverWithoutData as Discover,
  DISCOVER_QUERY,
} from "../";

const defaultProps = {
  discover: {
    loading: false,
    items: [
      { status: "featured" },
      { status: "featured" },
      { status: "featured" },
      { status: "open" },
      { status: "open" },
      { status: "open" },
    ],
  },
};

const generateComponent = (additionalProps = {}) => {
  const newProps = {
    ...defaultProps,
    ...additionalProps,
  };
  return <Discover { ...newProps } />;
};

it("renders with props", () => {
  const wrapper = shallow(generateComponent());
  expect(wrapper).toMatchSnapshot();
});

it("doesn't render if loading", () => {
  const wrapper = shallow(generateComponent({
    discover: {
      loading: true,
    },
  }));
  expect(wrapper).toMatchSnapshot();
});

it("parses query correctly", () => {
  expect(print(DISCOVER_QUERY)).toMatchSnapshot();
});
