import { Component, PropTypes } from "react";
import { connect } from "react-apollo";
import { withRouter } from "react-router";
import gql from "graphql-tag";

import { nav as navActions } from "../../../store";
// import ReactTooltip from "react-tooltip";
// import Truncate from "truncate";

import Split, { Left, Right } from "../../../blocks/split";
import GoogleMap from "../../../components/map";
import Layout from "./ResultLayout";

// HACK
let internalIp = null;
if (Meteor.isClient) {
  // NOTE: window.RTCPeerConnection is "not a constructor" in FF22/23
  const RTCPeerConnection = window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;   // compatibility for firefox and chrome

  if (RTCPeerConnection) {
    const pc = new RTCPeerConnection({ iceServers: [] });
    const noop = () => {};
    // create a bogus data channel
    pc.createDataChannel("");
    // create offer and set local description
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);
    // listen for candidate events
    pc.onicecandidate = (ice) => {
      if (!ice || !ice.candidate || !ice.candidate.candidate) return;
      const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
        .exec(ice.candidate.candidate)[1];
      internalIp = myIP;
      pc.onicecandidate = noop;
    };
  }
}

const mapStateToProps = ({ routing }) => {
  const { location } = routing;
  const tags = Object.keys(location.query).length && location.query.tags ? location.query.tags : "";
  const q = Object.keys(location.query).length && location.query.q ? location.query.q : null;
  return { tags, q, location };
};

const mapQueriesToProps = ({ ownProps }) => ({
  data: {
    query: gql`
      query GroupFinder($query: String, $tags: [String], $limit: Int, $offset: Int, $ip: String) {
        groups(query: $query, attributes: $tags, limit: $limit, offset: $offset, clientIp: $ip) {
          count
          results {
            id
            name
            entityId
            type
            kidFriendly
            demographic
            description
            photo
            ageRange
            distance
            schedule { description }
            locations { location { latitude, longitude } }
            tags { id, value }
            campus { name }
          }
        }
      }
    `,
    ssr: false,
    variables: {
      tags: ownProps.tags.split(",").filter(x => x),
      query: ownProps.q,
      ip: internalIp,
      limit: 10,
      offset: 0,
    },
  },
});
const defaultArray = [];
@withRouter
@connect({ mapQueriesToProps, mapStateToProps })
export default class Template extends Component {

  static propTypes = {
    q: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
    tags: PropTypes.string.isRequired,
    location: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  }

  state = {
    markers: [],
    showTags: false,
    showSearch: false,
    hover: null,
    groups: [], // XXX after refetchMore lands in apollo client, remove
    offset: 0,
  }

  componentWillMount() {
    if (this.props.q) this.setState({ showSearch: true });
    this.props.dispatch(navActions.setLevel("BASIC_CONTENT"));

    if (this.props.data.groups) {
      const markers = this.getMarkers(this.props.data.groups.results);
      this.setState({ markers, groups: this.props.data.groups.results });
    }
  }

  componentWillReceiveProps(nextProps) {
    const newState = {};

    if (this.props.q !== nextProps.q || this.props.tags !== nextProps.tags) {
      if (nextProps.data.groups && nextProps.data.groups) {
        newState.groups = nextProps.data.groups.results;
      } else {
        newState.groups = [];
      }
    }

    if (this.props.data.loading && !nextProps.data.loading && !this.state.groups.length) {
      newState.groups = nextProps.data.groups.results;
    }
    newState.markers = this.getMarkers(nextProps.data.groups && nextProps.data.groups.results);
    this.setState(newState);
  }

  onCardHover = (e) => {
    const { id } = e.currentTarget;
    this.setState({ hover: id });
  }

  onMarkerHover = (marker) => {
    this.setState({ hover: marker.id });
  }

  /* eslint-disable max-len */
  // createChild = (group) => (
  //   <div>
  //     <span className="locked-sides locked-ends" style={{cursor: "pointer"}} data-tip data-for={group.id}></span>
  //     <style>{`.toolTip { padding: 0 !important; border-radius: 6px !important; opacity: 1 !important; }`}</style>
  //     <ReactTooltip  class="toolTip" id={group.id} place="top" type="light" effect="solid">
  //       <Link to={`/groups/${group.id}`} className="plain display-block" onClick={(e) => console.log(e)}>
  //         <div className="background--light-primary rounded">
  //           <div className="grid flush rounded text-left" style={{width: "280px"}}>
  //             <div className="grid__item two-thirds hard" style={{verticalAlign: "middle"}}>
  //               <div className="one-whole text-left soft-half">
  //                 <h5 className="text-dark-primary">{group.name}</h5>
  //                 <p className="hard flush text-dark-primary"><small>{Truncate(group.description, 60)}</small></p>
  //               </div>
  //             </div>
  //             <div className="grid__item one-third hard locked-ends locked-right" style={{verticalAlign: "middle"}}>
  //               <div className="background--fill one-whole locked-ends locked-sides" style={{
  //                   backgroundImage: `url('${group.photo}')`,
  //                   borderRadius: "0 6px 6px 0"
  //               }}>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </Link>
  //     </ReactTooltip>
  //   </div>
  // )
  /* eslint-enable max-len */

  getMarkers = (groups = []) => {
    const { markers } = this.state;
    return _.uniq(markers.concat(groups
      .filter(x => x.locations && x.locations.length && x.locations[0].location)
      .map(x => ({
        latitude: x.locations[0].location.latitude,
        longitude: x.locations[0].location.longitude,
        id: x.id,
        // children: this.createChild(x),
      }))
      .filter(x => x.latitude && x.longitude)
    ), x => x.id);
  }

  toggleSearch = () => this.setState({ showSearch: !this.state.showSearch })
  toggleTags = () => this.setState({ showTags: !this.state.showTags })

  paginate = () => {
    const { q, tags } = this.props;
    this.props.data.refetch({
      tags: tags.split(",").filter(x => x),
      query: q,
      limit: 10,
      offset: this.state.offset + 10,
      ip: internalIp,
    })
      .then(({ data }) => {
        const { results } = data.groups;
        this.setState({
          groups: this.state.groups.concat(results),
          offset: this.state.offset + 10,
        });
      });
  }

  removeQueryString = (e) => {
    if (e) e.preventDefault();
    const { location, router } = this.props;

    if (location && location.query && location.query.q) delete location.query.q;
    const newPath = router.createPath(location);
    router.replace(newPath);
  }

  render() {
    const { data, tags, q } = this.props;
    let count;
    let groups = defaultArray;
    if (data.groups && data.groups.count) count = data.groups.count;
    groups = this.state.groups;

    let isMobile;
    if (typeof window !== "undefined" && window !== null) {
      isMobile = window.matchMedia("(max-width: 768px)").matches;
    }

    return (
      <div>
        <Split>
          {/* Map */}
          <Right mobile={false} classes={["background--left"]}>
            {(() => {
              if (isMobile || Meteor.isServer) return null;
              return (
                <GoogleMap
                  autoCenter
                  markers={this.state.markers}
                  onMarkerHover={this.onMarkerHover}
                  hover={this.state.hover}
                  onChildClick={({ id }) => this.props.router.push(`/groups/${id}`)}
                />
              );
            })()}
          </Right>
        </Split>
        <Left scroll classes={["background--light-secondary"]}>
          <Layout
            loading={data.loading}
            groups={groups}
            count={count}
            tags={tags && tags.split(",").filter(x => x)}
            query={q}
            removeQueryString={this.removeQueryString}
            showTags={this.state.showTags}
            toggleTags={this.toggleTags}
            showSearch={this.state.showSearch}
            toggleSearch={this.toggleSearch}
            onCardHover={this.onCardHover}
            paginate={this.paginate}
          />
        </Left>
      </div>
    );
  }
}
