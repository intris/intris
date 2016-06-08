import R from "ramda";

export const rotate =
  R.compose(R.map(R.reverse), R.transpose);
