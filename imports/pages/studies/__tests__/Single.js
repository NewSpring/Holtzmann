/* eslint-disable */
import renderer from "react-test-renderer";
import { shallow, mount } from "enzyme";
import { reset, startBuffering } from "aphrodite/lib/inject";

import { StudiesSingleWithoutData } from "../Single";
import headerActions from "../../../data/store/header";

jest.mock("../../../deprecated/database/collections/likes", () => {});
jest.mock("../../../components/content/related-content");

jest.mock("../../../deprecated/mixins/mixins.Shareable");
jest.mock("../../../deprecated/mixins/mixins.Header");

jest.mock("../EntryList");
jest.mock("../Hero");

jest.mock("../../../data/store/header", () => ({
  set: jest.fn(),
}));

const defaultProps = {
  dispatch: jest.fn(),
  params: {
    id: "1",
  },
  study: {
    content: {
      id: "1",
      meta: {
        urlTitle: "study",
      },
      channelName: "studies",
      children: [],
      content: {
        description: "<h1>study</h1>",
        images: [],
      },
    },
  },
};

beforeEach(() => {
  reset();
  startBuffering();
});

afterEach(() => {
  reset();
});

const generateComponent = (additionalProps = {}) => {
  const newProps = {
    ...defaultProps,
    ...additionalProps,
  };

  return <StudiesSingleWithoutData { ...newProps } />;
};

it("renders with no image", () => {
  const tree = renderer.create(generateComponent());
  expect(tree).toMatchSnapshot();
});

it("renders loading with no study", () => {
  const tree = renderer.create(generateComponent({
    study: {}
  }));
  expect(tree).toMatchSnapshot();
});

it("renders studies content", () => {
  const tree = renderer.create(generateComponent({
    study: {
      content: {
        id: "1",
        children: [{ id: "1"}],
        meta: {
          urlTitle: "study",
        },
        channelName: "studies",
        content: {
          description: "<h1>study</h1>",
          images: [
            { fileLabel: "1:1", url: "http://test.com/1x1.jpg" },
          ],
        },
      },
    }
  }));

  expect(tree).toMatchSnapshot();
});

it("dispatches store on mount", () => {
  const mockDispatch = jest.fn();
  headerActions.set = jest.fn();

  const wrapper = shallow(generateComponent({
    dispatch: mockDispatch,
  }));

  expect(mockDispatch).toHaveBeenCalledTimes(1);
  expect(headerActions.set).toHaveBeenCalledTimes(1);
});
