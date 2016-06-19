import GroundData from "./data/ground.json";

import { getData } from "./structs/block";
import { EMPTY, get } from "./structs/ground";

const WIDTH = GroundData.size.width;
const HEIGHT = GroundData.size.height;

export default class Renderer {
  constructor() {
    // TODO
    this.width = 100;
    this.height = 200;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    document.body.append(this.canvas);
    this.context = this.canvas.getContext("2d");
    this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  drawUnit(x, y, type) {
    if (type !== EMPTY) {
      this.context.fillRect(x * 10, y * 10, 10, 10);
    }
  }
  drawBlock(block) {
    const data = getData(block);
    for (let x = 0; x < data.size.width; x++) {
      for (let y = 0; y < data.size.height; y++) {
        if (data.data[y][x]) {
          this.drawUnit(x + block.x, y + block.y, block.type);
        }
      }
    }
  }
  drawGround(ground) {
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        this.drawUnit(x, y, get(ground, x, y));
      }
    }
  }
  render({ data }) {
    this.context.clearRect(0, 0, this.width, this.height);
    this.drawGround(data.ground);
    this.drawBlock(data.block);
  }
}
