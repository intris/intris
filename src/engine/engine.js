import R from "ramda";

import EngineData from "../data/engine.json";
import GroundData from "../data/ground.json";
import BlockData from "../data/block.json";

import Block from "../structs/block";
import Ground, { checkAvailable } from "../structs/ground";

import Random from "../utils/random";

export default class Engine {
  constructor() {
    this.random = new Random();
    this.ground = Ground();
    this.block = null;
    this.checkAvailable = checkAvailable(this.ground);
    this.delays = {
      drop: 0,
    };
    this.nexts = R.times(::this.randomType, EngineData.next);
  }
  randomType() {
    return this.random.next(BlockData.types.length);
  }
  nextBlock() {
    this.block = Block({
      type: R.head(this.nexts),
      x: Math.floor((GroundData.size.width - BlockData.size.width) / 2 + BlockData.offset.x),
      y: Math.floor(-BlockData.size.height / 2 + BlockData.offset.y),
    });
    this.nexts = R.append(this.randomType(), R.tail(this.nexts));
  }
  next({ count, config, input }) {
    return {
      action: "next",
      data: {
        ground: this.ground,
        block: this.block,
      },
    };
  }
}
