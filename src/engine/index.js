import R from "ramda";
import create from "@most/create";

import EngineData from "../data/engine.json";
import BlockData from "../data/block.json";

import Block from "../structs/block";
import Ground, {checkAvailable} from "../structs/ground";

import Random from "../utils/random";

class Engine {
  constructor() {
    this.random = new Random();
    this.ground = Ground({
      width: 10,
      height: 20
    });
    this.block = null;
    this.checkAvailable = checkAvailable(this.ground);
    this.delays = {};
    this.nexts = R.times(() => this.random.next(BlockData.types.length), EngineData.next);
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
