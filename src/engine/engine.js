import Core from "./core";

export default class Engine {
  constructor() {
    this.core = new Core();
  }
  next({ count, config, input }) {
    return {
      action: "next",
      data: {},
    };
  }
}
