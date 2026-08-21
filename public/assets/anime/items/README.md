# Runtime anime item assets

Files under this directory are optimized transparent WebP images used by the map renderer. The source illustrations are generated at high resolution; runtime copies are downsampled for the 58px map tiles to reduce download cost while keeping sharp rendering.

`manifest.json` is the stable integration point. Future art can be replaced by uploading a WebP/PNG and changing only the corresponding `file` entry.
