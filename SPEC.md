# Turtle Time - Game Specification

## Overview

**Turtle Time** is a 2D horizontal-scrolling ocean game for toddlers (ages 2-3). The player controls a sea turtle swimming through the ocean, avoiding hazards and enjoying colorful sea life. The game is gentle, forgiving, and designed to delight.

---

## Technology

- **Engine**: Phaser.js (v3)
- **Rendering**: WebGL with Canvas fallback
- **Language**: JavaScript
- **Deployment**: Runs in any modern browser (desktop + mobile)

---

## Core Requirements

### Controls
- **Keyboard**: Arrow keys and WASD for movement (up/down/left/right)
- **Mouse/Touch**: Turtle swims toward the pointer or finger position
- Input should feel smooth and responsive with gentle acceleration/deceleration

### Scrolling
- **Player-driven**: The world scrolls horizontally only when the turtle moves right
- The turtle can move freely in all four directions within the viewport
- The turtle cannot move off-screen
- Camera follows the turtle horizontally with slight look-ahead

### Difficulty & Lives
- 3 hearts (lives) displayed on the HUD
- Hitting an obstacle causes the turtle to flash/bounce back and lose 1 heart
- Brief invincibility period (~2 seconds) after being hit
- On losing all 3 hearts, show a friendly "Try Again" screen (no harsh game-over)
- Restarting places the turtle back at the beginning of the level

### Scoring
- Collect starfish scattered throughout the ocean for points
- Score displayed on screen using the HUD number sprites
- No time pressure

### Environment
- Ocean floor at the bottom using sand terrain tiles
- Seaweed and coral decorations on the ocean floor
- Parallax background layers for depth (far rocks, mid seaweed, near terrain)
- Bubbles rise gently from the ocean floor as ambient particles

---

## Asset Manifest

### Player Character
| Asset | Path |
|-------|------|
| Sea Turtle | `assets/characters/031-sea-turtle.png` |

### Obstacles (Hazards)
| Asset | Path |
|-------|------|
| Jellyfish | `assets/characters/004-jellyfish.png` |
| Shark | `assets/characters/028-shark.png` |
| Anchor | `assets/characters/001-anchor.png` |
| Fish Hook | `assets/characters/006-fish-hook.png` |
| Eel | `assets/characters/016-eel.png` |

### Collectibles
| Asset | Path |
|-------|------|
| Starfish | `assets/characters/026-starfish.png` |

### Decorative Sea Life (Non-interactive, ambient)
| Asset | Path |
|-------|------|
| Clown Fish | `assets/characters/019-clown-fish.png` |
| Blue Tang Fish | `assets/characters/014-blue-tang-fish.png` |
| Seahorse | `assets/characters/022-seahorse.png` |
| Octopus | `assets/characters/012-octopus.png` |
| Dolphin | `assets/characters/020-dolphin.png` |
| Whale | `assets/characters/030-whale.png` |
| Crab | `assets/characters/018-crab.png` |
| Shrimp | `assets/characters/009-shrimp.png` |
| Blowfish | `assets/characters/023-blowfish.png` |
| Stingray | `assets/characters/005-stingray.png` |
| Orange Fish | `assets/characters/fish_orange.png` |
| Blue Fish | `assets/characters/fish_blue.png` |
| Pink Fish | `assets/characters/fish_pink.png` |
| Green Fish | `assets/characters/fish_green.png` |

### Background & Environment
| Asset | Path |
|-------|------|
| Background Rocks (far) | `assets/background/background_rock_a.png`, `background_rock_b.png` |
| Background Seaweed (mid) | `assets/background/background_seaweed_a.png` through `h` |
| Background Terrain | `assets/background/background_terrain.png` |
| Background Terrain Top | `assets/background/background_terrain_top.png` |

### Ocean Floor Terrain Tiles
| Asset | Path |
|-------|------|
| Sand Fill | `assets/background/terrain_sand_a.png` through `d` |
| Sand Top | `assets/background/terrain_sand_top_a.png` through `h` |

### Ocean Floor Decorations
| Asset | Path |
|-------|------|
| Seaweed Green | `assets/background/seaweed_green_a.png` through `d` |
| Seaweed Pink | `assets/background/seaweed_pink_a.png` through `d` |
| Seaweed Orange | `assets/background/seaweed_orange_a.png`, `b` |
| Seaweed Grass | `assets/background/seaweed_grass_a.png`, `b` |
| Rock A | `assets/background/rock_a.png` |
| Rock B | `assets/background/rock_b.png` |
| Coral | `assets/characters/003-coral.png` |
| Seashell | `assets/characters/013-seashell.png` |
| Shell | `assets/characters/027-shell.png` |

### Effects
| Asset | Path |
|-------|------|
| Bubble A | `assets/misc/bubble_a.png` |
| Bubble B | `assets/misc/bubble_b.png` |
| Bubble C | `assets/misc/bubble_c.png` |

### HUD
| Asset | Path |
|-------|------|
| Numbers 0-9 | `assets/misc/hud_number_0.png` through `9` |
| Heart / Plus | `assets/background/hud_plus.png` |

---

## Milestones

---

### Milestone 1: Swimming Turtle

**Goal**: A playable scene where the turtle swims through a scrolling ocean environment.

**Features**:
- Phaser.js project scaffolded with an `index.html` entry point
- Ocean scene with a solid blue gradient background
- Sand terrain tiled along the bottom of the screen
- Seaweed and rocks placed on the ocean floor as decoration
- Parallax scrolling: far background rocks scroll slower, near terrain scrolls with the camera
- Sea turtle rendered on screen
- Keyboard controls (arrows + WASD): move turtle in all four directions
- Mouse/touch controls: turtle swims toward pointer/finger
- Player-driven horizontal scrolling: camera follows turtle as it moves right
- Turtle constrained to stay within the viewport bounds
- Gentle bobbing animation on the turtle when idle
- Bubble particles rise from the ocean floor periodically

**Assets Used**:
- `031-sea-turtle.png` (player)
- `terrain_sand_top_*.png`, `terrain_sand_a-d.png` (ocean floor)
- `background_rock_a.png`, `background_rock_b.png` (far parallax)
- `background_seaweed_a-h.png` (mid parallax)
- `seaweed_green_*.png`, `seaweed_pink_*.png`, `rock_a.png`, `rock_b.png` (floor decor)
- `bubble_a.png`, `bubble_b.png`, `bubble_c.png` (particles)

**Playable Outcome**: The player can move the turtle around a beautiful ocean. The world scrolls as the turtle swims right. Seaweed, rocks, and bubbles make it feel alive.

---

### Milestone 2: Obstacles & Collectibles

**Goal**: Add gameplay with hazards to avoid and starfish to collect.

**Features**:
- Starfish placed throughout the level as collectibles
- Collecting a starfish plays a brief sparkle/scale-up effect
- Score counter in the top-right corner using HUD number sprites
- Obstacles placed throughout the level: jellyfish (bobs up/down), anchors (stationary), fish hooks (hang from top of screen), sharks (patrol horizontally)
- Collision detection between turtle and obstacles
- On collision: turtle flashes, bounces back slightly, loses 1 heart
- 2-second invincibility window after getting hit (turtle blinks)
- 3 heart icons in the top-left corner of the HUD
- Losing all hearts shows a friendly "Try Again?" screen with a big restart button
- Decorative fish swim in the background (non-interactive, adds life to the scene)

**Assets Used**:
- Everything from Milestone 1
- `026-starfish.png` (collectible)
- `004-jellyfish.png`, `028-shark.png`, `001-anchor.png`, `006-fish-hook.png` (obstacles)
- `hud_number_0-9.png` (score display)
- `hud_plus.png` (heart icon)
- `fish_orange.png`, `fish_blue.png`, `fish_pink.png`, `fish_green.png` (decorative fish)
- `019-clown-fish.png`, `014-blue-tang-fish.png`, `022-seahorse.png` (decorative)

**Playable Outcome**: A complete gameplay loop -- swim, collect starfish, dodge obstacles, lose hearts, restart. A toddler can enjoy swimming and collecting, with gentle consequences for bumping into things.

---

### Milestone 3: Polish & Full Experience

**Goal**: A polished, complete game with a start screen, more variety, and delightful details.

**Features**:
- **Title Screen**: "Turtle Time" title with the sea turtle, animated bubbles, and a big "Play" button (tap/click anywhere to start)
- **Level variety**: The ocean gets more interesting as you swim further right -- more sea life, different seaweed colors, coral and shells on the floor
- **Ambient sea life**: Whale passes slowly in the far background, dolphin leaps, octopus hides behind rocks, crab walks on the ocean floor, stingray glides
- **Eel obstacle**: Eels peek out from behind rocks as an additional hazard
- **Sound effects**: Simple blip sounds for collecting starfish, a soft bump sound for hitting obstacles (generated programmatically or loaded if available)
- **Background music**: Gentle looping ocean ambience (generated or loaded)
- **Progressive density**: Early portion of the level is easy (few obstacles, lots of starfish), density increases gradually further right
- **End celebration**: After swimming far enough, show a "You did it!" celebration screen with colorful fish swimming around
- **Mobile-friendly**: Touch controls work well, game scales to fit the screen
- **Responsive layout**: Game resizes to fill the browser window

**Assets Used**:
- Everything from Milestones 1 & 2
- `003-coral.png`, `013-seashell.png`, `027-shell.png` (floor variety)
- `012-octopus.png`, `020-dolphin.png`, `030-whale.png` (ambient life)
- `018-crab.png`, `009-shrimp.png`, `023-blowfish.png`, `005-stingray.png` (ambient life)
- `016-eel.png` (new obstacle)
- `seaweed_orange_*.png`, `seaweed_grass_*.png` (more floor decoration variety)

**Playable Outcome**: A complete, polished toddler game. Title screen, varied ocean environment, ambient sea life, sound, and a victory celebration. Ready to hand to a 2.5-year-old and watch her smile.

---

## Project Structure

```
turtle-time/
  index.html              # Entry point, loads Phaser and game
  assets/                  # All art assets (existing)
  src/
    main.js               # Phaser game config and entry
    scenes/
      BootScene.js        # Asset preloading
      TitleScene.js       # Title/start screen (Milestone 3)
      GameScene.js        # Main gameplay scene
      GameOverScene.js    # Try again screen
      VictoryScene.js     # Celebration screen (Milestone 3)
    entities/
      Turtle.js           # Player turtle logic
      Obstacle.js         # Obstacle base behavior
      Starfish.js         # Collectible logic
      AmbientFish.js      # Decorative swimming fish
    utils/
      LevelGenerator.js   # Procedural placement of obstacles, collectibles, decor
      ParallaxBackground.js  # Parallax layer management
```
