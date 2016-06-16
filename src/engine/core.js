import R from "ramda";

import EngineData from "../data/engine.json";
import GroundData from "../data/ground.json";
import BlockData from "../data/block.json";

import Block, {
  getData,
  moveTo, moveBy,
  rotate, ROTATE_LEFT, ROTATE_RIGHT,
} from "../structs/block";
import Ground, { checkAvailable } from "../structs/ground";

import Random from "../utils/random";

export default class Core {
  constructor() {
    this.random = new Random();

    this.ground = Ground();
    this.block = null;
    this.nexts = R.times(::this.randomType, EngineData.next);
  }

  randomType() {
    return this.random.next(BlockData.types.length);
  }
  next() {
    const block = Block({
      type: R.head(this.nexts),
    });
    const data = getData(block);
    this.block = moveTo(block,
      Math.floor((GroundData.size.width - data.size.width) / 2 + BlockData.offset.x),
      Math.floor(-data.size.height / 2 + BlockData.offset.y));
    this.nexts = R.append(this.randomType(), R.tail(this.nexts));
  }

  checkAvailable(block = this.block) {
    return checkAvailable(this.ground, block);
  }

  drop() {
    this.block = moveBy(this.block, 0, 1);
  }
  canDrop() {
    return this.checkAvailable(moveBy(this.block, 0, 1));
  }
  tryDrop() {
    let result;
    if ((result = this.canDrop())) {
      this.drop();
    }
    return result;
  }

  rotate(direction, offset = [0, 0]) {
    this.block = rotate(moveBy(this.block, offset[0], offset[1]), direction);
  }
  canRotate(direction) {
    const data = getData(this.block);
    const rotatedData = getData(rotate(this.block, direction));
    for (let i = 0; i < data.position.length; i++) {
      const offset = [
        data.position[i][0] - rotatedData.position[i][0],
        data.position[i][1] - rotatedData.position[i][1],
      ];
      const rotated = rotate(moveBy(this.block, offset[0], offset[1]), direction);
      if (this.checkAvailable(rotated)) {
        return offset;
      }
    }
    return null;
  }
  tryRotate(direction) {
    let result;
    if ((result = this.canRotate(direction))) {
      this.rotate(direction, result);
    }
    return result;
  }

  rotateLeft(offset) {
    this.rotate(ROTATE_LEFT, offset);
  }
  canRotateLeft() {
    return this.canRotate(ROTATE_LEFT);
  }
  tryRotateLeft() {
    return this.tryRotate(ROTATE_LEFT);
  }

  rotateRight(offset) {
    this.rotate(ROTATE_RIGHT, offset);
  }
  canRotateRight() {
    return this.canRotate(ROTATE_RIGHT);
  }
  tryRotateRight() {
    return this.tryRotate(ROTATE_RIGHT);
  }
}
