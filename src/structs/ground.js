import R from "ramda";

import GroundData from "../data/ground.json";

import Block from "./block";

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
  data: new Int8Array(P_WIDTH * P_HEIGHT).fill(EMPTY)
});

export const isIn = R.curry((ground, x, y) =>
  x >= -P_LEFT &&
  x < WIDTH + P_RIGHT &&
  y >= -P_TOP &&
  y < HEIGHT + P_BOTTOM
);

export const get = R.curry((ground, x, y) => {
  if(!isIn(ground, x, y)) {
    return WALL;
  }
  return ground.data[(P_TOP + y) * P_WIDTH + P_LEFT + x];
});

export const checkAvailable = R.curry((ground, block) => {
  const data = Block.getData(block);
  for(let y = 0; y < data.length; y++) {
    for(let x = 0; x < data[y].length; x++) {
      if(data[y][x] && get(ground, x + block.x, y + block.y) !== EMPTY) {
        return false;
      }
    }
  }
  return true;
});
