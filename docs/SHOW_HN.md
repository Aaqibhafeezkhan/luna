# Show HN Launch Draft: Luna

**Title:** Show HN: Luna – Turn phone room videos into 60 FPS 3D WebGL twins with collisions

**URL:** https://github.com/atharhive/luna  
*(or live demo: https://instruction-antenna-reseller-patterns.trycloudflare.com)*

---

### Post Body

Hey HN,

I built Luna to solve a frustrating problem with indoor 3D digital twins: traditional photogrammetry produces 100MB+ polygon meshes that lag on mobile browsers, while neural radiance fields and raw Gaussian splats look great but lack physical boundaries—your camera ghosts through walls.

Luna decouples rendering from navigation:
1. **Photometric Layer:** 65,000+ Gaussian splats for view-dependent lighting at 60 FPS in WebGL.
2. **NavMesh & Collision Graph:** Discrete AABB collision volumes locked to human eye level (1.65m), preventing camera penetration.

It runs entirely in the browser with Three.js (no native app required) and includes:
- WASD + PointerLock first-person roaming & isometric dollhouse orbit
- 3D laser Euclidean distance measurement tool
- Client-side drag-and-drop photo/video ingestion
- Stanford `.ply` binary export

Code (MIT): https://github.com/atharhive/luna  
Live Demo: https://instruction-antenna-reseller-patterns.trycloudflare.com

I'd love feedback on the WebGL rendering performance across different devices and ideas for extending the NavMesh generation!
