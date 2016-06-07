import * as most from "most";

export default root => most.merge(
  most.fromEvent("keydown", root).map(event => ({
    type: "down",
    key: event.code
  })),
  most.fromEvent("keyup", root).map(event => ({
    type: "up",
    key: event.code
  }))
);
