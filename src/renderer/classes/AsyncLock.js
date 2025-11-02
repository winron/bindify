class AsyncLock {
    constructor () {
      this.disable = () => {}
      this.bottleneck = Promise.resolve()
    }
  
    enable () {
      this.promise = new Promise(resolve => this.disable = resolve)
    }
  }

const asyncLock = new AsyncLock();
module.exports = asyncLock;
