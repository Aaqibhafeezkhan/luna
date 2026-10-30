# Namma Space  
## Technical Abstract

Namma Space, developed through the Techfest IIT Bombay × Juspay innovation programme, is a spatial-computing platform for constructing interactive, metrically grounded digital twins of physical environments and connecting them to real-world navigation, discovery, and commerce. The system combines controlled optical capture, multi-view geometric reconstruction, 3D Gaussian Splatting, visual localization, semantic spatial indexing, and a discrete navigation layer into a unified campus-scale representation.

Unlike conventional virtual tours, which optimize primarily for visual appearance, Namma Space maintains two complementary spatial layers. The first is a continuous radiance-field layer that reproduces high-fidelity appearance, material response, and view-dependent illumination. The second is a discrete geometric layer composed of traversable NavMesh polygons and an adjacency graph, enabling collision detection, agent navigation, accessibility constraints, and spatial commerce operations. This separation allows photorealistic rendering and physically meaningful interaction to be optimized independently while remaining registered in a common world coordinate frame.

## Optical Capture and Frame Quality Control

Capture begins with a deterministic optical acquisition protocol designed to maximize multi-view overlap and minimize reconstruction degeneracy. Each scene is recorded using calibrated cameras along trajectories that maintain approximately 60–80% adjacent-frame overlap, controlled exposure, fixed focus, and sufficient parallax across the target volume. The operator captures:

- Establishing views for global scene coverage.
- Orbit trajectories around high-value objects and architectural features.
- Low- and high-elevation passes to reduce vertical occlusion.
- Detail passes for text, storefronts, entrances, and merchant inventory.
- Static frames for regions affected by motion, glare, or transient obstruction.

Frames are rejected before reconstruction using image-quality and capture-consistency tests. Let \(I_k\) denote a grayscale frame. A Laplacian sharpness metric is computed as

\[
B_k = \operatorname{Var}\left(\Delta I_k\right),
\]

where \(\Delta I_k\) is the discrete image Laplacian. Low values of \(B_k\) indicate defocus or motion blur. A frame is retained only when

\[
B_k \geq \tau_{\mathrm{blur}},
\]

with \(\tau_{\mathrm{blur}}\) selected by camera, focal length, and scene class during calibration. Additional rejection criteria include exposure saturation ratio, underexposure ratio, perceptual duplicate similarity, insufficient feature count, and excessive inter-frame motion. For a frame \(I_k\), the acceptance predicate can be expressed as

\[
q(I_k)=
\mathbf{1}\!\left[
B_k\geq\tau_{\mathrm{blur}}
\land
s_k\leq\tau_{\mathrm{sat}}
\land
u_k\leq\tau_{\mathrm{under}}
\land
F_k\geq\tau_{\mathrm{feat}}
\right].
\]

This quality gate prevents blurred or photometrically unstable images from contaminating feature matching, camera estimation, and radiance optimization.

## SfM Reconstruction and Metric Registration

For each accepted frame, local image features are extracted and matched across temporally adjacent and geometrically overlapping views. Given normalized image correspondences \(x_i\) and \(x_j\), the relative camera motion is constrained by epipolar geometry:

\[
x_j^{T} E x_i = 0,
\]

where \(E\) is the essential matrix. The essential matrix is estimated robustly using normalized correspondences and a RANSAC-based outlier model. Its singular value decomposition is

\[
E = U \operatorname{diag}(s_1,s_2,0)V^T,
\]

with the idealized constraint \(s_1=s_2\). Defining

\[
W =
\begin{bmatrix}
0 & -1 & 0\\
1 & 0 & 0\\
0 & 0 & 1
\end{bmatrix},
\]

the candidate relative rotations and translation direction are

\[
R_1 = UWV^T,\qquad
R_2 = UW^TV^T,\qquad
\hat{t} = U_{\cdot 3}.
\]

The physically valid configuration is selected through the cheirality condition, requiring reconstructed points to lie in front of both cameras. Camera poses are then globally refined using bundle adjustment. Let \(R_i,t_i\) be the pose of camera \(i\), \(X_j\) a reconstructed 3D point, \(x_{ij}\) its observed image measurement, and \(\pi(\cdot)\) the calibrated perspective projection. The optimization is

\[
\min_{\{R_i,t_i,X_j\}}
\sum_{i,j}
\rho\left(
\left\|
x_{ij}
-
\pi(R_iX_j+t_i)
\right\|_2^2
\right),
\]

where \(\rho\) is the Huber robust loss:

\[
\rho(s)=
\begin{cases}
s, & s\leq\delta^2,\\[4pt]
2\delta\sqrt{s}-\delta^2, & s>\delta^2.
\end{cases}
\]

The Huber formulation preserves quadratic convergence for inlier reprojection errors while limiting the influence of mismatched features, dynamic objects, rolling-shutter artifacts, and imperfect segmentation. Camera intrinsics, distortion parameters, poses, and landmark positions may be jointly optimized subject to gauge fixing and positive-depth constraints.

The resulting reconstruction is aligned to a metric campus coordinate system using surveyed control points, known architectural dimensions, or inertial and visual anchors. This scale alignment is essential because visual reconstruction alone is generally defined only up to a similarity transform.

## 3D Gaussian Splatting Radiance Layer

The appearance representation uses a set of anisotropic 3D Gaussians. Each Gaussian \(G_i\) is parameterized by a center \(\mu_i\in\mathbb{R}^3\), opacity \(o_i\), covariance \(\Sigma_i\), and view-dependent radiance coefficients. The covariance is factorized as

\[
\Sigma_i = R_i S_i S_i^T R_i^T,
\]

where \(R_i\in SO(3)\) is a rotation matrix and \(S_i\) is a diagonal scale matrix. This parameterization guarantees positive semidefiniteness while enabling stable optimization of orientation and anisotropic spatial extent.

The Gaussian density is

\[
G_i(x)=
\exp\left(
-\frac{1}{2}
(x-\mu_i)^T
\Sigma_i^{-1}
(x-\mu_i)
\right).
\]

During rasterization, each Gaussian is projected into screen space and depth sorted. Its contribution at a pixel is represented by an effective opacity \(\alpha_i\), obtained from the projected Gaussian density and learned opacity. The rendered color is alpha-composited as

\[
C =
\sum_{i=1}^{N}
c_i\alpha_i
\prod_{j=1}^{i-1}(1-\alpha_j),
\]

where \(c_i\) is the radiance emitted by Gaussian \(i\), and the transmittance term

\[
T_i=
\prod_{j=1}^{i-1}(1-\alpha_j)
\]

accounts for occlusion by nearer Gaussians.

View-dependent appearance is represented using spherical harmonics. For viewing direction \(d\), the emitted color of Gaussian \(i\) is

\[
c_i(d)=
\sum_{\ell=0}^{L}
\sum_{m=-\ell}^{\ell}
a_{i,\ell m}
Y_{\ell m}(d),
\]

where \(Y_{\ell m}\) are spherical-harmonic basis functions and \(a_{i,\ell m}\) are learned coefficients. This captures specular variation, directional reflectance, and illumination-dependent appearance without requiring a dense volumetric grid.

Training jointly minimizes photometric and structural losses over sampled camera views. A representative objective is

\[
\mathcal{L}
=
\lambda_1\mathcal{L}_{\mathrm{photo}}
+
\lambda_2\mathcal{L}_{\mathrm{SSIM}}
+
\lambda_3\mathcal{L}_{\mathrm{depth}}
+
\lambda_4\mathcal{L}_{\mathrm{reg}},
\]

where photometric consistency, structural similarity, depth agreement, and geometric regularization constrain the learned radiance field. The explicit Gaussian representation permits fast view synthesis and efficient level-of-detail streaming compared with dense voxel or implicit neural representations.

## Dual-Layer Spatial Architecture

Namma Space maintains a shared world coordinate frame containing two synchronized representations:

1. **Radiance Field Layer**  
   A continuous collection of 3D Gaussians optimized for photorealistic rendering, view-dependent radiance, progressive streaming, and visual localization.

2. **Interaction and Navigation Layer**  
   A discrete NavMesh consisting of walkable polygons, obstacle boundaries, semantic labels, accessibility metadata, merchant anchors, and an adjacency graph.

The NavMesh is generated from reconstructed geometry and semantic scene understanding. Walkable regions are constrained by maximum slope, minimum corridor width, obstacle clearance, stair and ramp semantics, and agent-specific dimensions. Each polygon \(p_k\) stores its vertices, surface normal, centroid, neighboring polygons, traversal cost, and semantic attributes.

The separation is architecturally significant: a radiance field may depict a visually plausible wall, table, or crowd without directly providing a robust collision surface. Conversely, a simplified collision mesh may support reliable traversal without reproducing the visual complexity of the scene. Namma Space therefore uses the radiance field for perception and rendering and the NavMesh for interaction, simulation, and spatial reasoning.

## Collision-Free Navigation

Path planning operates on the NavMesh adjacency graph. For a node \(n\), the modified A* evaluation function is

\[
f(n)=g(n)+h(n),
\]

with heuristic

\[
h(n)=\left\|x_n-x_{\mathrm{goal}}\right\|_2,
\]

where \(g(n)\) is the accumulated traversal cost and \(x_n\) is the node position. Edge costs incorporate Euclidean distance, surface slope, crowd density, semantic penalties, accessibility constraints, and temporary closures:

\[
g(n') =
g(n)
+
\|x_{n'}-x_n\|_2
+
\lambda_s C_{\mathrm{slope}}
+
\lambda_o C_{\mathrm{obstacle}}
+
\lambda_d C_{\mathrm{dynamic}}.
\]

The planner rejects transitions that violate agent clearance or intersect forbidden geometry. For dynamic updates, affected polygons and graph edges are invalidated locally rather than requiring full-world replanning.

The discrete path is converted into a continuous trajectory using Catmull-Rom spline interpolation. For control points \(P_{k-1},P_k,P_{k+1},P_{k+2}\), the interpolated segment is

\[
P(t)=\frac{1}{2}
\left[
2P_k
+(-P_{k-1}+P_{k+1})t
+(2P_{k-1}-5P_k+4P_{k+1}-P_{k+2})t^2
+(-P_{k-1}+3P_k-3P_{k+1}+P_{k+2})t^3
\right],
\]

for \(t\in[0,1]\). The spline is sampled and validated against NavMesh boundaries, obstacle clearance, and maximum curvature constraints. Any segment that violates collision constraints is locally shortened, reparameterized, or replanned through the graph.

## Juspay Spatial Commerce Integration

The platform extends the campus twin from a visualization system into a spatial commerce interface. Micro-merchants, kiosks, service counters, and temporary vendors are indexed as semantic spatial entities with coordinates, operating state, inventory metadata, queue status, and service radius. A spatial index supports efficient proximity queries and context-aware discovery:

\[
\mathcal{M}(q,r)=
\left\{
m \mid
\|p_m-p_q\|_2\leq r,\;
\operatorname{active}(m)=1
\right\},
\]

where \(p_q\) is the user or agent position and \(p_m\) is the merchant anchor.

Localized zero-touch checkout binds the transaction context to the user’s spatial presence, selected merchant, and validated service zone. Proximity payments can be initiated from a campus twin by selecting a merchant or product in the rendered environment, while the transaction layer independently verifies merchant identity, order state, authorization, and fulfillment location. Spatial anchoring is therefore used for discovery and intent capture without making geometric proximity alone sufficient for financial authorization.

This model supports campus-specific use cases including food ordering, event merchandise, queue-aware pickup, nearby services, and merchant discovery along a planned route. Spatial indexing also enables ranking based on walking distance, operating hours, crowd conditions, accessibility, and estimated fulfillment time.

## Representative Benchmark

The following benchmark is a representative engineering comparison for a campus-scale scene captured under equivalent visual coverage and evaluated on the same rendering hardware. Values are indicative and depend on scene complexity, image count, implementation, and quality targets.

| Representation | Memory Footprint | Interactive FPS | Reconstruction Time | Geometric Accuracy |
|---|---:|---:|---:|---:|
| Photogrammetry Mesh | 2–8 GB | 30–90 FPS | 2–8 hours | High on textured surfaces; weak under occlusion and view extrapolation |
| NeRF | 4–16 GB | 1–15 FPS without aggressive acceleration | 8–48 hours | Moderate-to-high appearance fidelity; implicit and difficult to collision-query |
| 3D Gaussian Splatting | 1–6 GB | 60–180 FPS | 20 minutes–4 hours | High visual fidelity with explicit, optimizable spatial primitives |

Photogrammetry meshes remain effective for conventional geometry processing and collision extraction but may require heavy textures, mesh cleanup, and topology repair. NeRFs provide strong continuous view synthesis but typically incur higher training and inference costs and do not directly expose a compact, editable geometric representation. 3D Gaussian Splatting offers a favorable compromise for Namma Space by combining rapid optimization, high-quality novel-view rendering, explicit spatial support, and efficient GPU rasterization. The NavMesh layer complements its remaining limitations by providing deterministic collision and traversal semantics.

## Conclusion

Namma Space presents a unified spatial-computing architecture in which calibrated capture, robust SfM, Huber-regularized bundle adjustment, anisotropic Gaussian radiance fields, geometric navigation, and spatial commerce operate over a common metric world model. Its central contribution is not merely the digitization of a campus, but the creation of an actionable spatial substrate: visually faithful enough for immersive exploration, geometrically structured enough for collision-free movement, and semantically indexed enough to support localized commerce. This combination enables campus digital twins to function simultaneously as renderable environments, navigation graphs, machine-interpretable scene models, and transaction-aware spatial interfaces.