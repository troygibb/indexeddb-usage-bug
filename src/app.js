import React, { useState, useEffect } from "react";
import WorkerManager from "./worker-manager";
import Database from "./database";
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
possible repros:
  - try to change the name dynamically
*/

class App extends React.Component {
  constructor() {
    super();
    this.startTime = Date.now();
    this.state = {
      numberOfDbs: [],
      idbStorageEstimates: [],
      times: []
    };
  }
  async componentDidMount() {
    while (true) {
      await deleteCreate();
      const metrics = await collectMetrics();
      const { numberOfDbs, idbStorageEstimates, times } = this.state;
      this.setState({
        numberOfDbs: [ ...numberOfDbs, metrics.numberOfDbs ],
        idbStorageEstimates: [ ...idbStorageEstimates, metrics.idbStorageEstimate / 1e6 ],
        times: [ ...times, (Date.now() - this.startTime) / 1000 ]
      });
      await delay(100);
      console.log(this.state);
      // delay(100);
    }
  }

  render() {
    return (
      <div>
        <h1>Time elapsed: {(Date.now() - this.startTime) / 1000}s</h1>
        <Chart
          data={this.state.idbStorageEstimates.map((estimateMb, i) => ({
            estimateMb,
            time: Math.floor(this.state.times[i])
          }))}
          dataKey={'estimateMb'}
        />
        <Chart
          data={this.state.numberOfDbs.map((num, i) => ({
            num,
            time: Math.floor(this.state.times[i])
          }))}
          dataKey={'num'}
        />
 
      </div>
    )
  }
}

export default App;
