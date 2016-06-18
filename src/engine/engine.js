import Core from "./core";

const State = {};

export default class Engine {
  constructor() {
    this.core = new Core();
  }
  loop() {}
  next({ frame, config, input }) {
    return {
      action: "next",
      data: {},
    };
  }
}
