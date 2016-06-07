import R from "ramda";
import most from "most";
import {EventEmitter} from "events";

class Storage extends EventEmitter {
  constructor(storage) {
    super();
    this.storage = storage;
    most.fromEvent("storage", window)
      .filter(R.propEq("storageArea", storage))
      .map(R.pick(["key"]))
      .forEach(action => {
        this.emit("change", action);
      });
  }
  get(key) {
    try {
      return JSON.parse(this.storage.getItem(key));
    } catch(error) {
      return null;
    }
  }
  set(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
    this.emit("change", {key});
  }
  delete(key) {
    this.storage.removeItem(key);
    this.emit("change", {key});
  }
  listen(key) {
    return most.fromEvent("change", this)
      .startWith({key})
      .filter(R.propEq("key", key))
      .map(() => this.get(key));
  }
}

export default new Storage(localStorage);
