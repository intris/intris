import R from "ramda";

export default R.curry((mapper, action) => (
  action.sample((action, mapper) => ({
    type: action.type,
    key: mapper[action.key]
  }), action, mapper.map(R.invertObj))
    .filter(R.prop("key"))
));
