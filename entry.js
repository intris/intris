import "core-js";
import "whatwg-fetch";
import "dom4";

import Game from "./src/game";
import Renderer from "./src/renderer";

const game = new Game();
const renderer = new Renderer();

game.run(::renderer.render);
