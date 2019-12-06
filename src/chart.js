import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';


const Chart = ({ data, dataKey, title, yAxisLabel }) => {
  if (data.length) {
    console.log(data)
  }
  return (
    <div>
      <h4>{title}</h4>
      <LineChart width={600} height={200} data={data} margin={{ top: 5, bottom: 5, right: 10, left: 10 }}>
        <Line type="monotone" dataKey={dataKey} stroke="#8884d8" dot={true} isAnimationActive={false} />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="timeElapsed" label="time elapsed (s)" />
        <YAxis dataKey={dataKey} label={yAxisLabel} />
      </LineChart>
    </div>
     // data={{ datasets: [{ 
        // data,
        // fill: false,
        // lineTension: 0,    
        // bezierCurve: false,
      // }]}} 
      // options={{
          // title: {
            // display: true,
            // text: 'idbSizeMb'
          // },
          // scales: {
              // xAxes: [{
                // display: true, 
                // labelString: 'time',
                // id: 'x-axis'
            //  }]
          // }
            // }}
//  
    // />
  )
}

export default Chart;