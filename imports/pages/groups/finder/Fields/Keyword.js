import { Component, PropTypes } from "react";
import Forms from "../../../../components/@primitives/UI/forms";
import Tag from "../../../../components/@primitives/UI/tags";

const focusedInput = {
  border: "1px solid #f0f0f0",
  borderRadius: 7,
  boxShadow: "0px 2px 9px #DDD",
  backgroundColor: "#FFFFFF",
  textTransform: "captialize",
  position: "relative",
  zIndex: 99,
};

const hiddenInput = {
  border: 0,
};

export default class Keywords extends Component {
  static propTypes = {
    tags: PropTypes.array.isRequired,
    selectedTags: PropTypes.array.isRequired,
    searchQuery: PropTypes.array.isRequired,
    tagOnClick: PropTypes.func.isRequired,
    inputOnChange: PropTypes.func.isRequired,
    iconName: PropTypes.string.isRequired,
    iconFill: PropTypes.string,
    iconWidth: PropTypes.string,
    iconHeight: PropTypes.string,
    iconTitle: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      focused: false,
    };

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
    document.addEventListener("touchstart", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
    document.removeEventListener("touchend", this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  // /**
  //  * Alert if clicked on outside of element
  //  */
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({
        focused: false,
      });
    }
  }

  setFocus = (focus: Boolean) => {
    this.setState({
      focused: focus,
    });
  };

  onBlur = event => {
    if (event.type === "keydown" && event.keyCode === 9) {
      if (!Meteor.isCordova) {
        this.setFocus();
      }
    }
  };

  render() {
    const {
      tags,
      tagOnClick,
      selectedTags,
      searchQuery,
      onChange,
      iconName,
      iconFill,
      iconWidth,
      iconHeight,
      iconTitle,
    } = this.props;

    const loweredTags = selectedTags.map(t => t.toLowerCase());

    return (
      <div
        style={this.state.focused ? focusedInput : hiddenInput}
        className={"soft-double-top text-left soft-half-sides"}
        ref={this.setWrapperRef}
        onKeyDown={this.onBlur}
      >
        <Forms.Input
          classes={this.state.focused ? "soft-bottom" : ""}
          inputClasses={
            "outlined--dotted outlined--light h6 capitalize flush-bottom text-black"
          }
          type="text"
          label={"I'm looking for..."}
          name="keywords"
          defaultValue={searchQuery}
          onChange={e => onChange(e)}
          onFocus={e => this.setFocus(true)}
          onBlur={this.onBlur}
          iconName={iconName}
          iconFill={iconFill}
          iconWidth={iconWidth}
          iconHeight={iconHeight}
          iconTitle={iconTitle}
        />
        <div
          className={`push-half-sides push-half-bottom ${!this.state.focused
            ? "visuallyhidden"
            : ""}`}
        >
          {/* weird SSR stuff here to investigate */}
          {tags.map((tag, i) =>
            <Tag
              className=""
              style={{ textTransform: "capitalize" }}
              onClick={tagOnClick}
              key={i}
              val={tag.value}
              active={loweredTags.indexOf(tag.value) + 1}
            />,
          )}
        </div>
      </div>
    );
  }
}
