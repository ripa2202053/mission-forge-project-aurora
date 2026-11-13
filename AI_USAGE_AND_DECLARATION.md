# 🤖 AI Usage and Declaration

> **NASA Space Apps Challenge 2026**  
> **Project:** Project Aurora — Deep-Space Expedition & Spacecraft Engineering Simulator  
> **Team:** MathaiBlock  
> **Submission Category:** Space Mission Game Design  

---

## 📜 1. Formal Declaration & Executive Statement

In accordance with the **NASA Space Apps Challenge 2026 Participation Guidelines**, the **NASA Open Science Policy**, and global standards of academic and engineering integrity, **Team MathaiBlock** hereby provides a full, transparent, and detailed disclosure of all Artificial Intelligence (AI) tools, machine learning models, and automated assistants utilized during the research, design, coding, audio composition, and documentation of **Project Aurora**.

We firmly believe in ethical, human-guided, and responsible AI usage. Artificial Intelligence was leveraged as an **accelerator, ideation catalyst, and pair-engineering co-pilot**—with every architectural decision, mathematical formulation, gameplay mechanic, and visual asset conceptualized, guided, audited, and verified by human team members.

---

## 🛠️ 2. Comprehensive AI Tooling Matrix

| Tool / Model | Developing Organization | Specific Role in Project Aurora | Human Verification & Oversight |
| :--- | :--- | :--- | :--- |
| **Google Antigravity** | Google DeepMind | Primary agentic coding environment, autonomous task orchestration, codebase refactoring, and test suite execution. | 100% of generated modules were reviewed, manually audited, and tested against 131 automated unit tests. |
| **Google Gemini (Audio Models / Gemini Pro)** | Google DeepMind | Cinematic ambient soundtrack generation, melodic motifs, audio arrangement, and procedural sound effect concepts. | Audio tracks were curated, filtered, mastered for Web Audio integration, and optimized for low-latency browser streaming. |
| **Gemini 1.5 Pro / Flash** | Google DeepMind | Multimodal narrative design, radio comms scriptwriting, historical Apollo/Artemis mission chatter phrasing, and NASA PDS citation formatting. | Scripts were fact-checked against authentic NASA transcripts, mission logs, and planetary science standards. |
| **GitHub Copilot / LLM Code Assistants** | GitHub / OpenAI | Contextual code autocompletion, boilerplate TypeScript/ESM typing, and WebGL shader syntax validation. | All completions were evaluated for computational efficiency, memory leaks, and Three.js garbage collection hygiene. |

---

## 🔬 3. Detailed Breakdown of AI Utilization by Domain

### A. Codebase Engineering & Architecture (Google Antigravity)
* **Agentic Pair-Programming:** We utilized **Google Antigravity** as our autonomous engineering harness. Antigravity enabled iterative development, rapid modular prototyping, and seamless integration between the front-end simulation engine and the back-end microservices.
* **Physics & Astrodynamics Implementation:**
  * Antigravity assisted in coding mathematical physics algorithms, including:
    * **Tsiolkovsky Rocket Equation:** Relativistic dry mass vs. propellant wet mass trade-offs.
    * **Porkchop Transfer Calculations:** Lambert solver trajectory optimization and hyperbolic excess velocity ($v_\infty$).
    * **Inverse-Square Law Attenuation:** Solar irradiance and panel electrical generation ($1/r^2$) from 1.0 AU (Earth) to 5.2 AU (Jupiter).
    * **Atmospheric Drag & Aerodynamic Heating:** Angle of Attack (AoA) thermal protection cone calculations for the "Seven Minutes of Terror" Martian entry minigame.
* **Automated Unit Testing & Quality Assurance:**
  * AI workflows generated and maintained an automated test suite of **131 end-to-end tests** (`node --test`), verifying orbital dynamics, campaign branching, multiplayer room locking, and UI state isolation with zero regressions.

---

### B. Music & Procedural Audio Design (Gemini Audio Models & Web Audio API)
* **Cinematic Soundtracks:**
  * The background atmospheric ambient music—including the official theme *"Project Aurora (Deep-Space Odyssey)"* and the dramatic high-tension planetary approach scores—were composed and generated using **Google Gemini audio models**.
  * Prompts were specifically crafted around cinematic space synth aesthetics (inspired by Vangelis, Hans Zimmer's *Interstellar*, and NASA Apollo soundscapes).
* **Procedural Sound Synthesis (Web Audio API):**
  * Gemini assisted in writing native Web Audio API oscillators and bandpass biquad filter nodes:
    * **Authentic NASA Quindar Tones:** 2,525 Hz intro and 2,475 Hz outro radio beeps replicating real Apollo and Artemis ground station relays.
    * **Biometric Tension Heartbeat:** Dual-sine wave rhythmic LFO generating a dynamic "Lub-Dub" cardiac pulse that accelerates during critical hull damage or high radiation.
    * **Spacecraft Subsystem Audio:** Ion drive frequency whine, RCS steering bursts, supersonic parachute deploy whoosh, and docking latch confirmation clicks.

---

### C. Narrative, Lore & Radio Communications
* **Story Arc ("The Lost Telemetry of Odyssey"):**
  * Gemini 1.5 Pro was employed to brainstorm and script the narrative arc connecting Jezero Crater, Shackleton Crater, Vesta, and Europa.
* **NASA Radio Chatter Scripting:**
  * Generated authentic radio dialogues for:
    * **Dr. Imani Vance** (Houston Flight Director)
    * **Chief Marcus Reyes** (Propulsion & Systems Engineer)
    * **Dr. Aris Sen** (PDS Astrobiology Lead)
    * **Cape Canaveral CAPCOM**
  * Dialogue was prompted with strict aerospace communication protocol: callsigns, MHz channel frequencies, speed-of-light delay acknowledgments, and flight rule acronyms (FDIR, CAM, LOS, AOS, DSN).

---

### D. NASA Open Data Integration & API Microservice
* **NASA Mission Data API (`https://nasa-mission-data-api.vercel.app/`):**
  * Gemini and Antigravity aided in scaffolding an Express/Vercel edge microservice to bypass CORS restrictions on official NASA servers.
  * Facilitated parsing and transformation of complex NASA Planetary Data System (PDS) datasets, JPL Horizons ephemerides, and NOAA Space Weather Prediction Center (SWPC) solar proton flux streams.
* **Offline Fallback Architecture:**
  * AI helped construct an offline-first progressive enhancement pipeline that guarantees 0ms latency by embedding verified static snapshots of authentic NASA PDS datasets.

---

### E. 3D WebGL Graphics & Shader Optimization
* **Three.js Shader Optimization:**
  * Antigravity helped tune GLSL fragment shaders and Three.js `UnrealBloomPass` post-processing parameters for photorealistic planetary atmospheres, solar glare flaring, and warp streaking.
* **3D Asset Normalization:**
  * Automated bounding box normalization and geometry centering scripts for official NASA 3D models (Perseverance, Ingenuity, Deep Space 1, Dawn, Bennu), ensuring consistent scale and collision envelopes.

---

## 🧑‍💻 4. Human Oversight, Validation & Code Ownership

To ensure total compliance with scientific rigor and academic honesty:

1. **Every Line Audited:** No AI-generated code was committed to the repository without line-by-line human review, testing, and approval.
2. **Scientific Ground Truth:** All telemetry values, coordinates (e.g., Jezero Crater $18.38^\circ\text{N}, 77.58^\circ\text{E}$), spectral absorption bands (e.g., 2.20 $\mu\text{m}$ clay mudstone), and surface temperatures were manually verified against published NASA technical papers and PDS Geosciences archives.
3. **Prompt Engineering & Creative Direction:** All creative concepts, UI layouts, game rules, balance curves, and mission architectures were originated and directed by human team members.
4. **Reproducibility:** The entire build pipeline, source code, and automated test suite are publicly available and reproducible on any modern node/browser environment.

---

## ⚖️ 5. Ethical & Open Science Compliance

* **Open-Source Licensing:** Project Aurora is released under the **MIT License**. All upstream libraries (Three.js, Vite) and NASA public domain resources have been attributed in compliance with their respective licenses.
* **No Proprietary Data Leaks:** No private, confidential, or copyrighted proprietary datasets were used as training data or prompt context.
* **Open Science Contribution:** By documenting our custom NASA Mission Data API and AI workflows, we provide a reusable, educational blueprint for future NASA Space Apps Challenge participants.

---

## 👥 Sign-Off & Authorship Confirmation

* **Project:** Project Aurora  
* **Team:** MathaiBlock  
* **Lead Developers:** Mahbubur Rahman & Team  
* **Event:** NASA Space Apps Challenge 2026 Global Hackathon  
* **Repository:** [https://github.com/Mahbub0001/mission-forge-project-aurora](https://github.com/Mahbub0001/mission-forge-project-aurora)  
* **Date of Declaration:** November 2026  

*We declare under penalty of disqualification that the information contained in this document represents a true, accurate, and complete disclosure of AI technologies employed in Project Aurora.*
