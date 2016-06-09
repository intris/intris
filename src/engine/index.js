import R from "ramda";
import create from "@most/create";

import EngineData from "../data/engine.json";
import GroundData from "../data/ground.json";
import BlockData from "../data/block.json";

import Block from "../structs/block";
import Ground, {checkAvailable} from "../structs/ground";

import Random from "../utils/random";

class Engine {
  constructor() {
    this.random = new Random();
    this.ground = Ground();
    this.block = null;
    this.checkAvailable = checkAvailable(this.ground);
    this.delays = {
      drop: 0
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
      y: Math.floor(-BlockData.size.height / 2 + BlockData.offset.y)
    });
    this.nexts = R.append(this.randomType(), R.tail(this.nexts));
  }
  next({count, config, input}) {
    return {
      action: "next",
      data: {
        ground: this.ground,
        block: this.block
      }
    };
  }
}

export default R.curry(({config, input}, ticker) =>
  create((next, complete, error) => {
    const engine = new Engine();
    const subscription = ticker
      .sample((count, config, input) => ({
        count, config, input
      }), ticker, config, input)
      .map(::engine.next)
      .subscribe({
        next: ({action, data}) =>
          R.cond([
            [R.equals("complete"), R.always(complete)],
            [R.equals("error"), R.always(error)],
            [R.T, R.always(next)]
          ], action)(data),
        complete, error
      });
    return () =>
      subscription.unsubscribe();
  })
);
