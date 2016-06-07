import most from "most";

import Input from "./config/input";

import Ticker from "./utils/ticker";
import Keyboard from "./input/keyboard";
import KeyStore from "./input/utils/key-store";
import KeyMapper from "./input/utils/key-mapper";

export default class Game {
  constructor() {
    const ticker = Ticker();
    const input =
      KeyStore(Input.keys)(
        KeyMapper(most.of(Input.methods.keyboard))(
          Keyboard(document)));
    this.subscription =
      ticker.sample((count, input) => ({
        count, input
      }), ticker, input)
        .subscribe({});
  }
  destroy() {
    this.subscription.unsubscribe();
  }
}
