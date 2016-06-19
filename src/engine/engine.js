import log from "loglevel";

import Core from "./core";

const State = {
  Begin: "begin",
  Create: "create",
  DelayShow: "delay-show",
  Show: "show",
  CheckDead: "check-dead",
  CheckDrop: "check-drop",
  DelayDrop: "delay-drop",
  Drop: "drop",
  DelayLock: "delay-lock",
  Lock: "lock",
  End: "end",
};

export default class Engine {
  constructor() {
    this.frame = 0;
    this.core = new Core();
    this.state = State.Begin;
    this.delays = {
      show: 0,
      drop: 0,
      lock: 0,
    };
  }
  trace(...args) {
    log.trace("%o [%s]", this.frame, String(this.state).toUpperCase(), ...args);
  }
  delay(name, config) {
    this.delays[name]++;
    const result = this.delays[name] > config.delay[name];
    if (result) {
      this.delays[name] = 0;
    }
    return result;
  }
  resetLockDelay() {
    // FIXME
    this.delays.lock = 0;
  }
  actKey() {
    const hasMoved = false;
    return hasMoved;
  }
  act({ config }) {
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
        // TODO: IRS & IHS
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
        this.delays.lock++;
        break;
      }

      case State.Lock: {
        core.lock();
        this.trace();
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
  loop(data) {
    let previousState = null;
    while (previousState !== this.state) {
      previousState = this.state;
      this.act(data);
    }
  }
  next({ frame, config, input }) {
    for (let __ = 0; __ < frame; __++) {
      this.frame++;
      this.loop({ config, input });
    }
    if (this.state === State.End) {
      return {
        action: "complete",
      };
    }
    return {
      action: "next",
      data: this.core,
    };
  }
}
