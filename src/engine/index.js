import R from "ramda";
import create from "@most/create";

import Engine from "./engine";

export default R.curry(({ config, input }, ticker) =>
  create((next, complete, error) => {
    const engine = new Engine();
    const subscription = ticker
      .sample((frame, config, input) =>
        ({ frame, config, input }),
        ticker, config, input)
      .map(::engine.next)
      .subscribe({
        next: (data) =>
          R.cond([
            [R.equals("complete"), R.always(complete)],
            [R.equals("error"), R.always(error)],
            [R.T, R.always(next)],
          ])(data.action)(data),
        complete, error,
      });
    return () =>
      subscription.unsubscribe();
  })
);
