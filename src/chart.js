import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

const Chart = ({ data, dataKey, title, yAxisLabel }) => (
  <div>
    <h4>{title}</h4>
    <LineChart
      width={600}
      height={200}
      data={data}
      margin={{
        top: 5,
        bottom: 5,
        right: 10,
        left: 10
      }}
    >
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke="#8884d8"
        dot
        isAnimationActive={false}
      />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis dataKey="timeElapsed" label="time elapsed (s)" />
      <YAxis dataKey={dataKey} label={yAxisLabel} />
    </LineChart>
  </div>
);

export default Chart;
