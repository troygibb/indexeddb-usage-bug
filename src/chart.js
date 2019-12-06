import React from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';


const Chart = ({ data, dataKey }) => {
  console.log(data)
  return (
    <div>
      <LineChart width={600} height={200} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <Line type="monotone" dataKey={dataKey} stroke="#8884d8" dot={true} isAnimationActive={false} />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="time" />
        <YAxis dataKey={dataKey} />
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