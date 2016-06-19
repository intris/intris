import R from "ramda";

import GroundData from "../data/ground.json";

import { getData } from "./block";

const WIDTH = GroundData.size.width;
const HEIGHT = GroundData.size.height;

const P_LEFT = GroundData.padding.left;
const P_RIGHT = GroundData.padding.right;
const P_TOP = GroundData.padding.top;
const P_BOTTOM = GroundData.padding.bottom;

const P_WIDTH = P_LEFT + WIDTH + P_RIGHT;
const P_HEIGHT = P_TOP + HEIGHT + P_BOTTOM;

export const EMPTY = -1;
export const WALL = 0xFF;

export default () => ({
  data: new Int8Array(P_WIDTH * P_HEIGHT).fill(EMPTY),
});

export const isIn = R.curry((ground, x, y) =>
  x >= -P_LEFT &&
  x < WIDTH + P_RIGHT &&
  y >= -P_TOP &&
  y < HEIGHT + P_BOTTOM
);

export const get = R.curry((ground, x, y) => {
  if (!isIn(ground, x, y)) {
    return WALL;
  }
  return ground.data[(P_TOP + y) * P_WIDTH + P_LEFT + x];
});

export const set = R.curry((ground, x, y, type) => {
  if (!isIn(ground, x, y)) {
    return;
  }
  ground.data[(P_TOP + y) * P_WIDTH + P_LEFT + x] = type;
});

export const checkAvailable = R.curry((ground, block) => {
  const data = getData(block);
  for (let x = 0; x < data.size.width; x++) {
    for (let y = 0; y < data.size.height; y++) {
      if (data.data[y][x] && get(ground, x + block.x, y + block.y) !== EMPTY) {
        return false;
      }
    }
  }
  return true;
});

export const place = R.curry((ground, block) => {
  const data = getData(block);
  for (let x = 0; x < data.size.width; x++) {
    for (let y = 0; y < data.size.height; y++) {
      if (data.data[y][x]) {
        set(ground, x + block.x, y + block.y, data.type);
      }
    }
  }
});
