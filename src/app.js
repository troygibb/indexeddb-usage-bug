import React from "react";
import Chart from "./chart";

const STORE_NAME = 'store';

const open = async (name) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onerror = reject;
    request.onsuccess = (e) => resolve(e.target.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      const store = db.createObjectStore(STORE_NAME, {
        autoIncrement: true
      });
      store.transaction.oncomplete = () => {
        resolve(db);
      }
      store.transaction.onerror = reject;
    }
  })
}

const fill = async (db) => {
  return new Promise(async (resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = resolve;
    tx.onerror = reject;
    const store = tx.objectStore(STORE_NAME);
    for (let i = 0; i < 1000; i++) {
      const request = store.add({ data: new ArrayBuffer(1e6) /* 1Mb */ });
      request.onerror = reject;
    }
 });
}

const deleteIdb = async (name) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onerror = reject;
    request.onsuccess = resolve;
    request.onblocked = reject;
  });
}

const delay = (ms = Math.random() * 10) => new Promise(resolve => setTimeout(() => {console.log(ms); resolve()}, ms));

const deleteCreate = async () => {
  try {
    await Promise.all(['left', 'right'].map(async (prefix) => {
      for (let i = 0; i < 5; i++) {
        const name = `${prefix}-${i}`;
        await deleteIdb(name);
        const db = await open(name);
        await fill(db);
        db.close();
      }
    }));
  } catch (e) {
    console.error(e);
  }
}


const collectMetrics = async () => {
  if (!navigator || !navigator.storage || !navigator.storage.estimate) {
    throw new Error('navigator.storage.estimate not supported; this repro only supports the latest version of Google Chrome');
  }
  const estimate = await navigator.storage.estimate();
  const { indexedDB: idbStorageEstimate} = estimate.usageDetails;
  const databases = await window.indexedDB.databases();
  return { idbStorageEstimate, numberOfDbs: databases.length };
}


/*
TODO:
  - run prettier

*/

// Takes about 85s to create the first data point.
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      numberOfOps: 15,
      numberOfDbs: [],
      idbStorageEstimates: [],
      timesElapsed: [],
      timeToDeleteCreate: [],
      startedExperiment: false,
      experimentStartTime: 0,
    };
    this.startExperiment = this.startExperiment.bind(this);
  }

  async startExperiment() {
      this.setState({ startedExperiment: true, experimentStartTime: Date.now() });
      while (this.state.timesElapsed.length < this.state.numberOfOps) {
        const start = performance.now();
        await deleteCreate();
        const timeToDeleteCreate = (performance.now() - start) / 1000; // Convert from ms to s.
        const metrics = await collectMetrics();
        const { numberOfDbs, idbStorageEstimates, timesElapsed } = this.state;
        this.setState({
          numberOfDbs: [ ...numberOfDbs, metrics.numberOfDbs ],
          idbStorageEstimates: [ ...idbStorageEstimates, metrics.idbStorageEstimate / 1e6 ],
          timesElapsed: [ ...timesElapsed, (Date.now() - this.state.experimentStartTime) / 1000 ],
          timeToDeleteCreate: [ ...this.state.timeToDeleteCreate, timeToDeleteCreate ] 
        });
        await delay(100);
      }
  }

  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <div>
          <label>Number of create/delete operations: </label><input type="number" min="1" max="100" disabled={this.state.startedExperiment} onChange={(e) => {
            this.setState({ numberOfOps: e.target.value});
          }} value={this.state.numberOfOps} />
          <i> Number of iterations of creating and deleting IndexedDB instances.</i>
        </div>
       <button disabled={this.state.startedExperiment} onClick={this.startExperiment}>Start Experiment</button>
        <h1>Time elapsed: {this.state.experimentStartTime ? (Date.now() - this.state.experimentStartTime) / 1000 : 0}s</h1>
        <i>Note: It takes about 85 seconds to create the first data point. You'll see that number increase as indexeddb usage increases.</i>
        <Chart
          title={'idb storage estimate (Mb)'}
          data={this.state.idbStorageEstimates.map((estimateMb, i) => ({
            estimateMb,
            timesElapsed: Math.floor(this.state.timesElapsed[i])
          }))}
          dataKey={'estimateMb'}
          yAxisLabel="Mb"
        />
        <Chart
          title={'# of dbs'}
          data={this.state.numberOfDbs.map((num, i) => ({
            num,
            timesElapsed: Math.floor(this.state.timesElapsed[i])
          }))}
          dataKey={'num'}
          yAxisLabel="#"
        />
         <Chart
          title={'time to create and delete dbs'}
          data={this.state.timeToDeleteCreate.map((time, i) => ({
            time,
            timesElapsed: Math.floor(this.state.timesElapsed[i])
          }))}
          dataKey={'time'}
          yAxisLabel="s"
        />
        <p>
        <b>navigator.userAgent: </b><i>{navigator.userAgent}</i>
        </p>
      </div>
    )
  }
}

export default App;
