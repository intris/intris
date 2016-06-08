import R from "ramda";

import Block from "./block";

export const EMPTY = -1;
export const WALL = 0xFF;

export default ({width, height}) => ({
  width, height,
  data: new Int8Array(width * height).fill(EMPTY)
});

export const get = R.curry((ground, x, y) => {
  if(x < 0 || x >= ground.width || y < 0 || y >= ground.height) {
    return WALL;
  }
  return ground.data[y * ground.width + x];
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
