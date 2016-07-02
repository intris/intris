import Random from "../utils/random";

import BlockData from "../data/block.json";

export default class EngineRandom extends Random {
  constructor(seed) {
    super(seed);
    this.pack = [];
  }
  nextPack() {
    for (let i = 0; i < BlockData.types.length; i++) {
      this.pack.push(i);
    }
    let i = this.pack.length;
    while (--i) {
      const j = super.next(i + 1);
      [this.pack[i], this.pack[j]] = [this.pack[j], this.pack[i]];
    }
  }
  next() {
    if (!this.pack.length) {
      this.nextPack();
    }
    return this.pack.shift();
  }
}
