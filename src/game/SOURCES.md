# Sources, attribution, and authored content

## Mars investigation reference

NASA, [Cracks in Ancient Martian Mud Surprise NASA's Curiosity Rover Team](https://www.nasa.gov/missions/mars-science-laboratory/curiosity-rover/cracks-in-ancient-martian-mud-surprise-nasas-curiosity-rover-team/), consulted 2026-10-07. This informs the interpretation of clay/sulfate minerals and changing water-related environments. The game does **not** import measured spectra from this article. Training curves, indices, uncertainties, sites and route schedules are authored synthetic values. See CAMPAIGN.md for model limitations.

## NASA 3D Models and Visual Resources (NASA-3D-Resources)

The simulation integrates authentic, open-source 3D models from the official [NASA 3D Resources Repository](https://github.com/nasa/NASA-3D-Resources) (NASA / JPL / GSFC / ARC public domain release):

| Asset | Source / Subdirectory in NASA-3D-Resources | In-Game Mission Usage |
|---|---|---|
| `models/Perseverance.glb` | `3D Models/Mars 2020 Perseverance Rover` | Mars Stage 3 & 4 Surface Exploration & Sample Return Rover |
| `models/Ingenuity.glb` | `3D Models/Ingenuity Mars Helicopter` | Mars Stage 4 Crater Floor Aerial Scout Drone |
| `models/AsteroidBennu.glb` | `3D Models/1999 RQ36 asteroid` | Vesta / Asteroid Approach & Celestial Topography Mesh |
| `models/ApolloLunarModule.glb` | `3D Models/Apollo Lunar Module` | Moon Stage 4 Artemis Outpost & Precision Landing Site |
| `models/ISS.glb` | `3D Models/International Space Station (ISS) (A)` | Earth / LEO Stage 5 Orbital Rendezvous & Station Docking |
| `models/DSN70m.glb` | `3D Models/Deep Space Network 70-meter` | Deep Space Network Ground Station Radar Tracking Array |
| `models/Dawn.glb` | `3D Models/Dawn` | Vesta Campaign & Hangar 3D Asset Inspector |
| `models/DeepSpace1.glb` | `3D Models/Deep Space 1` | Orbital Bay Explorer Spacecraft & Assembly Hangar |
| `models/PrimaryIonDrive.glb` | `3D Models/PrimaryIonDrive` | Xenon Ion Thruster Propulsion Subsystem Inspection |

## Planet textures bundled with the game

| Local asset | Source and credit |
|---|---|
| `public/textures/mars.jpg` | [NASA Mars Image Texture](https://science.nasa.gov/3d-resources/mars/). NASA / Jet Propulsion Laboratory / Caltech. Viking images processed at USGS. Direct asset: `https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/mars/Mars.jpg` |
| `public/textures/jupiter.jpg` | [NASA Jupiter texture](https://science.nasa.gov/3d-resources/jupiter/). Direct asset: `https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/jupiter/Jupiter.jpg` |
| `public/textures/earth.jpg` | [Three.js example planet textures](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets), `earth_atmos_2048.jpg`. Downloaded from the Three.js example asset host. The game does not claim this is live Earth imagery. |
| `public/textures/moon.jpg` | [Three.js example planet textures](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets), `moon_1024.jpg`. Downloaded from the Three.js example asset host. Also used as illustrative terrain for Vesta; it is not a Vesta map. |

NASA image-use information: [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). Third-party credits and usage conditions should be reviewed when preparing the team’s final public submission. No NASA logo is used in the game.

## Scientific context

- [NASA Mars](https://science.nasa.gov/mars/) — Mars and evidence of past water.
- [NASA Moon](https://science.nasa.gov/moon/) — lunar environment and polar exploration.
- [NASA Dawn](https://science.nasa.gov/mission/dawn/) — Vesta and planetary differentiation.
- [NASA Jupiter](https://science.nasa.gov/jupiter/) — gas giant environment; no solid landing surface.
- [NASA Earth](https://science.nasa.gov/earth/) — Earth observations and remote sensing.
- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/2026/) — challenge context; no endorsement is implied.

Planet radius, approximate gravity, and representative orbital distance are educational context. The stated travel days are fictional scenario parameters, not calculated launch-window solutions. Mission cost, equipment mass, fuel, power, communications, science points, hazard frequency, and all vehicle performance parameters are game design values.

The displayed ideal single-stage velocity increment is `Δv = Isp × 9.80665 × ln(wet mass / dry mass)`. It neglects steering losses, gravity losses, staging, finite burn duration, launch windows, thermal constraints, and many other real mission factors.

## Original and generated content

Spacecraft, rover, station geometry, terrain, procedural material textures, HUD art, story, and sound synthesis code were created for this project. No frame from the supplied video is used as a fake interactive backdrop. The video served as a visual reference.

Browser speech synthesis uses a locally available system/browser voice. Captions remain available when voice output is unsupported.

## Software and fonts

- Three.js — MIT
- Vite — MIT
- Playwright — Apache-2.0 (development verification)
- Rajdhani, IBM Plex Mono, Inter — SIL Open Font License, distributed through Fontsource

The fonts, rendering libraries, and image files needed for gameplay are bundled into the production build. Gameplay makes no external data/API calls. External links in the credits panel open only when selected.


## Assembly engineering model

- NASA Glenn, Specific Impulse: https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/specific-impulse/ — Isp and thrust / propellant mass-flow relationship. Consulted 2026-10-07.
- NASA Small Spacecraft State of the Art, Power: https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/ — solar power dependence on solar distance. Consulted 2026-10-07.
- The game uses ideal delta-v, Newtonian initial acceleration and inverse-square illumination. Propulsion ratings (200 kN, 0.35 N, 280 kN), power-system ratings (18 kW at 1 AU, 2.4 kW conceptual radioisotope rack, 20 kW conceptual fission system), 60% electric propulsion efficiency, hardware masses and costs are authored concept assumptions, not specifications of actual NASA spacecraft. Mean solar distance is used. Geometry is procedural and illustrative, not an engineering CAD model.
