// Public renderer entrypoint. The scene now owns hero/enemy/map rendering in
// one Canvas layer so coordinates, z-order and scaling cannot drift apart.
export { createCanvasTowerScene } from './anime-canvas-scene.js';
