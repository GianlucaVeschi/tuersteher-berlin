// Entry point: build the world, hook up the page, then start the game loop.
import { buildCity } from './world/city';
import { initCityScene } from './world/scenes';
import { initCanvas } from './render/canvas';
import { initInput } from './input';
import { initCard } from './ui/card';
import { start } from './game/loop';
import { initMusic } from './audio/music';

buildCity();
initCityScene();
initCanvas();
initInput();
initCard();
initMusic();
start();
