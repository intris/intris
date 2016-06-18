import R from "ramda";

import BlockData from "../data/block.json";
import * as matrix from "../utils/matrix";

const types =
  R.map(item =>
    R.zipWith((data, position) =>
      ({ ...item, data, position }),
      R.scan(matrix.rotate, item.data, R.range(1, 4)),
      item.position),
    BlockData.types);

export default ({ type = -1, rotate = 0, x = 0, y = 0 } = {}) =>
  ({ type, rotate, x, y });

export const rotate = R.curry((block, direction) => ({
  ...block,
  rotate: R.mathMod(block.rotate + direction, 4),
}));

export const ROTATE_LEFT = -1;
export const ROTATE_RIGHT = 1;

export const moveTo = R.curry((block, x, y) =>
  ({ ...block, x, y }));

export const moveBy = R.curry((block, x, y) => ({
  ...block,
  x: block.x + x,
  y: block.y + y,
}));

export const getData = ({ type, rotate }) =>
  types[type][rotate];
