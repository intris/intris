import R from "ramda";

export default R.curry((keys, action) => {
  let state = R.zipObj(keys, R.repeat(false, keys.length));
  return action.map(action => {
    if (keys.includes(action.key)) {
      state = R.assoc(action.key, action.type === "down", state);
    }
    return state;
  }).startWith(state);
});
