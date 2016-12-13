// @flow
import {
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryScatter,
  VictoryArea,
} from "victory";

type ILineGraph = {
  axisStyles: Object,
  data: Object[],
  dotColor: string,
  dotSize: string,
  lineColor: string,
  lineWidth: string,
};

const getTickFormat = (data: Object[]) => {
  const ticks = data.map((x) => (x.tick));
  return ticks;
};

const GradientGroup = ({ style, events, transform, children, gradientColor }) => (
  <g
    style={style}
    {...events}
    transform={transform}
  >
    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset=".5" stopOpacity="1" stopColor={gradientColor} />
        <stop offset="1" stopOpacity="0" stopColor={gradientColor} />
      </linearGradient>
    </defs>
    {children}
  </g>
);

const LineGraph = ({
  axisStyles,
  data,
  dotColor,
  dotSize,
  lineColor,
  lineWidth,
}: ILineGraph) => (
  <div className="">
    <VictoryChart
      padding={{ top: 5, left: 10, right: 10, bottom: 50 }}
      height={160}
      padding={{ top: 5, left: 10, right: 10, bottom: 20 }}
      animate={{ duration: 2000 }}
    >
      <VictoryAxis
        style={{
          axis: {
            stroke: `${axisStyles.axis.lineColor}`,
            strokeWidth: `${axisStyles.axis.lineWidth}`,
          },
          tickLabels: {
            fontFamily: "colfax-web, sans-serif",
            fontSize: `${axisStyles.tickLabels.fontSize}`,
            fill: `${axisStyles.tickLabels.fill}`,
          },
        }}
        tickFormat={getTickFormat(data)}
      />
      <VictoryArea
        data={data}
        x="month"
        y="amount"
        groupComponent={<GradientGroup gradientColor={lineColor} />}
        style={{
          data: { fill: "url(#gradient)", stroke: "none", opacity: 0.5 },
        }}
      />
      <VictoryLine
        data={data}
        x="month"
        y="amount"
        style={{
          data: { stroke: `${lineColor}`, strokeWidth: `${lineWidth}` },
        }}
      />
      <VictoryScatter
        data={data}
        x="month"
        y="amount"
        size={dotSize}
        style={{
          data: { fill: lineColor },
        }}
      />
    </VictoryChart>
  </div>
);

export default LineGraph;
