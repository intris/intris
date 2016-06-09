import R from "ramda";

import BlockData from "../data/block.json";
import * as matrix from "../utils/matrix";

const WIDTH = BlockData.size.width;
const HEIGHT = BlockData.size.height;

const empty = Object.freeze(
  R.times(() => R.repeat(0, WIDTH), HEIGHT));

const data =
  R.map(item =>
    R.map(Object.freeze,
      R.scan(matrix.rotate, item.data, R.range(0, 3))),
    BlockData.types);

export default ({type = -1, rotate = 0, x = 0, y = 0} = {}) => ({
  type, rotate, x, y
});

export const rotate = R.curry((block, offset) => ({
  ...block,
  rotate: R.mathMod(block.rotate + offset, 4)
}));

export const rotateLeft =
  rotate(R.__, -1);

export const rotateRight =
  rotate(R.__, 1);

export const moveTo = R.curry((block, x, y) => ({
  ...block, x, y
}));

export const moveBy = R.curry((block, x, y) => ({
  ...block,
  x: block.x + x,
  y: block.y + y
}));

export const getData = ({type, rotate}) =>
  type === -1
    ? empty
    : data[type][rotate];
