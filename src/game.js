import R from "ramda";

import EngineData from "./data/engine.json";
import InputData from "./data/input.json";

import storage from "./utils/storage";

import Ticker from "./utils/ticker";
import Keyboard from "./input/keyboard";
import KeyMapper from "./input/utils/key-mapper";
import KeyStore from "./input/utils/key-store";

import Engine from "./engine";

export default class Game {
  constructor() {
    const ticker = Ticker();
    const input =
      Keyboard(document)
        .thru(KeyMapper(storage.listen("input.keyboard")
          .map(R.defaultTo(InputData.methods.keyboard))))
        .thru(KeyStore(InputData.keys));
    const config =
      storage.listen("engine.config")
        .map(R.defaultTo(EngineData.config));
    this.stream =
      ticker
        .thru(Engine({config, input}));
  }
  run() {
    return new Promise((resolve, reject) => {
      this.subscription =
        this.stream
          .subscribe({
            complete: resolve,
            error: reject
          });
    });
  }
  destroy() {
    this.subscription.unsubscribe();
  }
}
