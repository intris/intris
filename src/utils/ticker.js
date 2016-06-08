import create from "@most/create";

export default () =>
  create(next => {
    let paused = false;
    let handler = -1;
    function callback() {
      next(1);
      if(!paused) {
        handler = requestAnimationFrame(callback);
      }
    }
    handler = requestAnimationFrame(callback);
    return () => {
      paused = true;
      if(handler !== -1) {
        cancelAnimationFrame(handler);
      }
    };
  });
