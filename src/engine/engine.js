import log from "loglevel";

import EngineCore from "./core";

const State = {
  Begin: "begin",
  Create: "create",
  DelayShow: "delay-show",
  Show: "show",
  Hold: "hold",
  CheckDead: "check-dead",
  CheckDrop: "check-drop",
  DelayDrop: "delay-drop",
  Drop: "drop",
  DelayLock: "delay-lock",
  Lock: "lock",
  ClearLine: "clear-line",
  End: "end",
};

const Key = {
  MoveLeft: "move-left",
  MoveRight: "move-right",
  Drop: "drop",
  HardDrop: "hard-drop",
  RotateLeft: "rotate-left",
  RotateRight: "rotate-right",
  Hold: "hold",
};

const Keys = [
  Key.Hold,
  Key.HardDrop,
  Key.RotateLeft,
  Key.RotateRight,
  Key.MoveLeft,
  Key.MoveRight,
  Key.Drop,
];

export default class Engine {
  constructor() {
    this.frame = 0;
    this.core = new EngineCore();
    this.state = State.Begin;
    this.keyState = {};
    for (const key of Keys) {
      this.keyState[key] = {
        isDown: false,
        delayed: false,
        start: -1,
        count: -1,
        previous: -1,
      };
    }
    this.delays = {
      show: 0,
      drop: 0,
      lock: 0,
    };
  }
  trace(...args) {
    log.trace("%o [%s]", this.frame, String(this.state).toUpperCase(), ...args);
  }
  resetLockDelay() {
    // TODO
    this.delays.lock = 0;
  }
  next({ frame, config, input }) {
    if (this.state === State.End) {
      return {
        action: "complete",
      };
    }
    for (let __ = 0; __ < frame; __++) {
      this.processFrame({ config, input });
      this.frame++;
    }
    return {
      action: "next",
      state: this.state,
      data: this.core,
      delays: this.delays,
    };
  }
  processFrame({ config, input }) {
    this.updateInput(input);
    let previousState = null;
    while (previousState !== this.state) {
      previousState = this.state;
      this.processState(config);
    }
  }
  updateInput(input) {
    for (const key of Keys) {
      this.updateKey(key, input[key]);
    }
  }
  updateKey(key, isDown) {
    const core = this.core;
    const state = this.keyState[key];
    const previousIsDown = state.isDown;
    if (isDown) {
      state.isDown = true;
      if (!previousIsDown) {
        if (!core.showBlock) {
          state.delayed = true;
        }
        state.start = this.frame;
      }
      if (core.showBlock) {
        state.delayed = false;
      }
      if (state.delayed) {
        state.count = 0;
      } else {
        state.count++;
      }
    } else {
      state.isDown = false;
      state.delayed = false;
      state.start = -1;
      state.count = -1;
      state.previous = -1;
    }
  }
  processState(config) {
    const core = this.core;
    switch (this.state) {
      case State.Begin: {
        this.trace();
        this.state = State.Create;
        break;
      }

      case State.Create: {
        core.next();
        core.showBlock = false;
        this.trace(core.block);
        this.state = State.DelayShow;
        break;
      }

      case State.DelayShow: {
        if (this.delays.show >= config.delay.show) {
          this.delays.show = 0;
          this.state = State.Show;
          break;
        }
        this.delays.show++;
        break;
      }

      case State.Show: {
        core.showBlock = true;
        this.delays.drop = 0;
        // TODO: IRS & IHS
        this.trace(core.block);
        this.state = State.CheckDead;
        break;
      }

      case State.Hold: {
        core.hold();
        this.delays.drop = 0;
        this.trace(core.block);
        this.state = State.CheckDead;
        break;
      }

      case State.CheckDead: {
        if (core.isDead()) {
          this.state = State.End;
          break;
        }
        this.state = State.CheckDrop;
        break;
      }

      case State.CheckDrop: {
        if (core.canDrop()) {
          this.state = State.DelayDrop;
        } else {
          this.resetLockDelay();
          this.state = State.DelayLock;
        }
        break;
      }

      case State.DelayDrop: {
        if (!core.canDrop()) {
          this.state = State.CheckDrop;
          break;
        }
        if (this.delays.drop >= config.delay.drop) {
          this.delays.drop = 0;
          this.state = State.Drop;
          break;
        }
        if (this.processInput(config)) {
          if (this.state !== State.DelayDrop) {
            break;
          }
          this.state = State.CheckDrop;
          break;
        }
        this.delays.drop++;
        break;
      }

      case State.Drop: {
        core.drop();
        this.state = State.CheckDrop;
        break;
      }

      case State.DelayLock: {
        if (core.canDrop()) {
          this.state = State.CheckDrop;
          break;
        }
        if (this.delays.lock >= config.delay.lock) {
          this.delays.lock = 0;
          this.state = State.Lock;
          break;
        }
        if (this.processInput(config)) {
          if (this.state !== State.DelayLock) {
            break;
          }
          this.state = State.CheckDrop;
          break;
        }
        this.delays.lock++;
        break;
      }

      case State.Lock: {
        core.lock();
        this.trace();
        this.state = State.ClearLine;
        break;
      }

      case State.ClearLine: {
        core.clearLines();
        this.state = State.Create;
        break;
      }

      case State.End: {
        // TODO
        this.trace();
        break;
      }
    }
  }
  processInput(config, keys = Keys) {
    const previousState = this.state;
    let hasMoved = false;
    for (const key of keys) {
      if (this.shouldProcessKey(key, config)) {
        hasMoved = hasMoved || this.processKey(key);
        if (previousState !== this.state) {
          return hasMoved;
        }
      }
    }
    return hasMoved;
  }
  shouldProcessKey(key, config) {
    const state = this.keyState[key];
    if (!state.isDown) {
      return false;
    }
    // TODO: support state.delayed
    // FIXME: when Key.MoveLeft & Key.MoveRight both down
    switch (key) {
      case Key.MoveLeft: {
        if (
          this.keyState[Key.MoveRight].isDown &&
          this.keyState[Key.MoveRight].start > state.start) {
          return false;
        }
        break;
      }
      case Key.MoveRight: {
        if (
          this.keyState[Key.MoveLeft].isDown &&
          this.keyState[Key.MoveLeft].start >= state.start) {
          return false;
        }
        break;
      }
      case Key.RotateLeft: {
        if (
          this.keyState[Key.RotateRight].isDown &&
          this.keyState[Key.RotateRight].start > state.start) {
          return false;
        }
        break;
      }
      case Key.RotateRight: {
        if (
          this.keyState[Key.RotateLeft].isDown &&
          this.keyState[Key.RotateLeft].start >= state.start) {
          return false;
        }
        break;
      }
    }
    switch (key) {
      case Key.Hold:
      case Key.HardDrop:
      case Key.RotateLeft:
      case Key.RotateRight: {
        return state.count === 0 && state.previous !== state.count;
      }
      case Key.MoveLeft:
      case Key.MoveRight: {
        if (
          state.count >= config.das &&
          (state.count - config.das) % config.arr === 0 &&
          state.count - state.previous >= config.arr) {
          return true;
        }
        if (state.count === 0 && state.previous !== state.count) {
          return true;
        }
        return false;
      }
      case Key.Drop: {
        return (
          state.count % config["drop-arr"] === 0 &&
          state.count - state.previous >= config["drop-arr"]);
      }
    }
    return false;
  }
  processKey(key) {
    const core = this.core;
    const state = this.keyState[key];
    state.previous = this.frame - state.start;
    switch (key) {
      case Key.MoveLeft: {
        return core.tryMoveLeft();
      }

      case Key.MoveRight: {
        return core.tryMoveRight();
      }

      case Key.Drop: {
        let result;
        if ((result = core.tryDrop())) {
          this.delays.drop = 0;
        }
        return result;
      }

      case Key.HardDrop: {
        while (core.tryDrop());
        this.state = State.Lock;
        return true;
      }

      case Key.RotateLeft: {
        let result;
        if ((result = core.tryRotateLeft())) {
          this.state = State.CheckDrop;
        }
        return result;
      }

      case Key.RotateRight: {
        let result;
        if ((result = core.tryRotateRight())) {
          this.state = State.CheckDrop;
        }
        return result;
      }

      case Key.Hold: {
        let result;
        if ((result = core.canHold())) {
          this.state = State.Hold;
        }
        return result;
      }
    }
    return false;
  }
}
