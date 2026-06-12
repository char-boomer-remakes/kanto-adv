# Kanto Adventure

A first-person Pokémon adventure in the browser: explore a **miniature Kanto
laid out like the real Gen 1 map** — all ten towns from Pallet to Cinnabar —
with your **Pokémon walking ahead of you in view**, catch all 151 Pokémon
with **physical, aimable Poké Ball throws** (slow-mo, curveballs, timing
rings, critical catches), fight wild Pokémon and trainers in real time —
or press **T** and **become your Pokémon**: move it yourself, aim its
attacks like an FPS, and dodge for real by not being where the hit lands.
Watch moves **scorch, crater and frost the terrain**, fish the lakes,
weather the storms, foil **Team Rocket**, earn the **Bike Voucher** and ride
the Bicycle, earn all **eight gym badges** and climb Victory Road to the
**Champion fight at the Indigo Plateau**. Authentic Gen 1 underneath: real
stats, DVs, Stat Exp, moves, PP, catch rates, growth curves, the type
chart — and opponents who **start out dim and wise up as you collect
badges**.

The story opens the way it always has — a **title screen with three save
files**, then **Professor Oak's monologue**, naming yourself and his
grandson, choosing your starter, and getting jumped by your **rival in the
lab** — except this Kanto has been thoroughly modernized: Oak laments that
people only meet Pokémon through their feeds, every town square has
**doomscrolling NPCs** lit by their phone screens, your rival is a
**streamer farming content** off your battles (he ambushes you at 2 and 5
badges, runs the counter-starter line, and waits at the Indigo Plateau as
Champion under the name you gave him), and your own Pokédex ships with
**PokéGram** pre-installed — press **G** for an infinite feed that
occasionally begs you to go touch the tall grass.

Every Pokémon in the world is a **custom procedural 3D model** — all 151
species are assembled at runtime from low-poly primitives (no model files,
fully offline) and **animated procedurally**: walk gaits, wing flaps,
slithering, hovering, squash-and-stretch hops, flickering tail flames,
breathing and blinks. The classic sprites now appear only in the 2D UI
(party, Pokédex, boxes).

Built with **Vite + TypeScript + Three.js**.

## Run it

```bash
npm install
npm run dev
```

`npm run dev` **opens the game in your browser automatically** (Vite's
`--open`); if nothing pops, it's at **http://localhost:5173**.

- `npm run build` / `npm run preview` — production build (outputs `dist/`)
- `npm run typecheck` — TypeScript check
- `npm test` — headless-browser e2e suite (107 checks; needs Chrome + a dev
  server running; point it elsewhere with `KANTO_URL=http://localhost:PORT`)

> **Fully offline.** The 3D Pokémon are generated procedurally (no model
> files at all), the classic sprites used by the 2D UI are bundled in
> `public/sprites/`, and Three.js comes from `node_modules` — once
> `npm install` has run, no internet connection is needed to play.

## Controls

| Input | Action |
|---|---|
| **WASD** | move |
| **Mouse** | look (click once to capture the pointer) |
| **Shift** | run · **Space** jump |
| **Tap click** | quick-throw the equipped Ball at your target |
| **Hold click** | **aim mode**: time slows, a trajectory arc + timing ring appear; release to throw, flick sideways for a **curveball**, right-click to cancel |
| **Mouse wheel** | cycle Poké / Great / Ultra Ball |
| **B** | toss a Razz Berry to the targeted wild (easier catch) |
| **F** | start a battle with the targeted Pokémon |
| **E** | interact (trainers, Nurse Joy, PC, shop, berry bushes, fishing, petting your partner...) |
| **V** | mount / dismount your ride (Bicycle, and later... a truck) |
| **L** | flashlight (caves get *dark*) |
| **1–4** | use moves in battle (turns, cooldowns or aimed — depends on your battle style) |
| **Q** | **dodge** — call it while the enemy telegraphs its attack; a clean dodge opens a counter window *(Arena / First-Person)* |
| **T** | **take over / step out** — possess your Pokémon, or return to the trainer *(First-Person style)* |
| **Space** | *(possessed)* **signature dodge** — dash, Blink, Burrow, Swoop... whatever your species does |
| **Click** | *(possessed)* repeat your last move |
| **C** | switch Pokémon · **R** run from wild battles |
| **G** | **PokéGram** — doomscroll the in-game feed (your playtime is on the lock screen, no judgement) |
| **Tab** | Pokédex · **P** party · **I** bag · **Esc** pause (cheats live here) |

## The region

The overworld follows the **original Red/Blue/Yellow town map**:

- **West column** — Pallet Town, north past Viridian City (Earth Gym) and
  Viridian Forest up to Pewter City (Boulder Gym).
- **Northern ridge** — Route 3/4 tunnels through **Mt. Moon** to Cerulean City
  (Cascade Gym); **Nugget Bridge** crosses the river to Bill's sea cottage;
  the sealed **Cerulean Cave** broods across the water.
- **Center** — Saffron City (Marsh Gym, Silph Co.) ringed by Routes 5/6/7/8,
  with Celadon City (Rainbow Gym, Department Store, Game Corner) to the west
  and Vermilion City (Thunder Gym, the S.S. Anne — and a certain truck) on
  the bay to the south.
- **East** — Lavender Town and its Pokémon Tower; **Rock Tunnel** above it,
  the **Power Plant** (Zapdos) across the river, and the Route 12/13 causeway
  running down the coast.
- **South** — **Cycling Road** drops from Celadon to Fuchsia City (Soul Gym)
  and the **Safari Zone**; sea Routes 19/20/21 link the **Seafoam Islands**
  (Articuno) and **Cinnabar Island** (Volcano Gym, the Mansion) back to
  Pallet.
- **Northwest** — Route 23 and **Victory Road** (Moltres) climb to the
  **Indigo Plateau**, where the Champion waits.

All 8 gyms gate like the real thing: wild levels rise with distance from
Pallet, Cerulean Cave needs every badge, and the corner minimap mirrors the
classic town-map silhouette.

## What's in the game

- **A faithful opening, told from today.** Boot to a **title screen** that
  orbits Pallet Town while you pick one of **three save files** (trainer
  name, badges, Pokédex count and playtime on each card — delete and start
  over RBY-style). New games run the real intro: Oak's *"Welcome to the
  world of POKÉMON!"* speech beside a showcase Nidorino, **you name
  yourself and your rival** (presets or free text), and after you take your
  starter and your Pokédex (*"Press TAB for science. Press G to doomscroll.
  I trust you to know the difference!"*), your rival grabs the counter-pick
  and battles you **right outside the lab** — his unboxing stream starts in
  five.
- **A rival with a content schedule.** He ambushes you again at **two
  badges** and **five badges**, his team growing along the counter-starter
  line (Pidgeotto, Kadabra, his evolving starter...), every loss "deleted
  from the VOD." At the Indigo Plateau he's **Champion — under the name you
  gave him** — and the Hall of Fame records the trainer name you chose.
  Every line of dialogue in Kanto knows both names.
- **Modern Kanto, visibly.** Every town square has **phone-zombie
  civilians**: heads bowed, thumbs flicking, faces lit by the glow of their
  screens (strongest at night). Interrupt them (E) for rotating takes —
  *"TECHNOLOGY is incredible! Even Mt. Moon has 5G!"* — and gym wins now
  trend on PokéGram.
- **PokéGram (G).** A full doomscroll app on your Pokédex: an **infinite
  feed** of trainer posts, gym-leader takes, sponsored Silph Co. slop and
  your rival's grindset updates — pull for more, it never ends, except
  every ~13 posts the app develops a conscience and shows your **playtime**
  next to a suggestion to touch grass.
- **Wild Pokémon live where animals live.** Every species spawns into its
  natural element: **birds, bats and winged bugs circle overhead** (look up —
  their shadows track the ground below); **fish, tentacles and water-edge
  swimmers bob in lakes and seas** and dive when spooked; **larvae and
  cocoons perch up in the canopies**, fluttering tree-to-tree (Metapod just
  hardens and stays put); small grassland dwellers rustle around the **tall
  grass clusters**; the rest roam open ground. Skittish fliers climb out of
  reach; aggressive ones (Spearow, Zubat) **swoop down on you**. Start a
  battle and the wild dives to ground level — flee, and the bird beats its
  wings and takes off again. Balls arc true through all of it: you can pick
  a Pidgey clean **out of the sky** (it freezes mid-air, the Ball drops to
  the turf below), and lobs at swimmers skim the surface instead of
  plunking. Only the **legendaries and key Pokémon hold fixed ground**:
  Articuno still circles its Seafoam shrine, Mewtwo still waits in his cave.
  The Pokédex lists each species' habitat ("Lives: on the wing — look up").
- **Your partner walks with you — where you can see it.** It trots ahead-left
  of you in first person, gets sent out from your side when battles start,
  and can be petted (E) to build **happiness** — at max friendship it earns
  +10% XP. Fire/Electric/Ghost partners light up caves and night roads. Pick
  *any* party member ("Walk with me" in the party screen, P) or send it back
  to its Ball; the choice is saved.
- **Opponents learn as you do.** Early-route trainers and wild Pokémon pick
  moves on instinct; with every badge the opposition reads matchups better,
  until gym leaders and the Champion play optimally. Prefer it fixed? Set
  **Opponent AI** (Esc menu) to Novice / Trained / Ace.
- **Custom 3D Pokémon.** Every species is a hand-specced procedural model:
  21 body archetypes (quadruped, biped, bird, serpent, fish, blob, larva,
  cocoon, winged bug, crab, jellyfish, bivalve, golem, plant, magnet, ball,
  starfish, egg cluster, ghost, bat, mole-mound) dressed per species with
  Gen 1 palettes and signature parts — Charmander's tail flame, Squirtle's
  shell, Pikachu's zigzag tail and red cheeks, Arbok's hood, Onix's rock
  chain, Doduo's two heads, Voltorb's Poké Ball shells, Magneton's triple
  magnets, Snorlax's belly. Each rig animates procedurally: leg gaits that
  speed up with movement, wing flaps, slithering, hovering ghosts, flopping
  Magikarp, breathing, blinking, flickering flames. They turn to face their
  opponent in battle, watch you as you walk by, and the walking partner looks
  back at you when you stop.
- **Battles mark the world.** Fire chars the grass, Ground and Rock crack
  craters, Ice frosts the field, Grass sprouts blooms, big hits rustle
  leaves out of nearby trees, cave ceilings shed debris under heavy quakes —
  and the marks linger before fading. Rain turns flames to steam, storms
  super-charge Electric moves with sky-bolts, and a target standing in water
  takes conducted Electric damage.
- **Earn your ride.** Survive the Vermilion Fan Club Chairman's Rapidash
  stories for a **Bike Voucher**, trade it at the Cerulean **Bike Shop**
  (sticker price: ₽1,000,000) and ride with **V** at double speed —
  handlebars, bell and all. After eight badges, the infamous S.S. Anne
  truck's engine finally turns over.
- **Catching 2.0.** Balls are physical projectiles with gravity, bounces and
  splashes. Hold to aim: bullet-time, trajectory preview, a shrinking timing
  ring (Nice / Great / Excellent multipliers), curveball bonuses, berry
  bonuses, and rare **critical catches** that scale with your Pokédex.
- **Three battle styles — pick yours in the pause menu (Esc).**
  - **Classic** is the originals: true turn-based rounds. You pick a move
    (or throw, switch, item, run — each spends your turn), priority and Speed
    decide who goes first, poison ticks between rounds, and the opponent
    politely waits while you think. No dodging, no cooldowns, pure RBY.
    A thrown Ball is your whole turn **even if it misses** — the wild gets
    its free swing and play comes straight back to you — and the bag and
    switch menus are sealed while a round is still resolving.
  - **Arena** (default) is the balanced middle: real-time with cooldowns,
    watched from over your Pokémon's shoulder. Enemies telegraph attacks
    (red bar): hit **Q** to dodge — success depends on Speed, and a clean
    dodge opens a counter window. Honest, even-handed numbers.
  - **First-Person** is the high-skill mode: every battle starts INSIDE your
    Pokémon, and the damage swings both ways with how well you play.
- **First-Person style — BE your Pokémon.** The camera dives into your
  partner's eyes and the battle becomes a first-person action fight with a
  **higher ceiling and a lower floor**:
  - **You move it yourself** — WASD + mouse, with speed that comes from its
    real Speed stat and body plan. Pikachu zips, Snorlax lumbers, Magikarp
    flops helplessly on land but rules the water, and birds, ghosts and
    levitators glide straight over deep water.
  - **Aim is the accuracy — and the damage.** Ranged moves are real
    projectiles fired down your crosshair: dead-center hits land **"Clean
    hit!"** bonuses (up to ~1.35×), grazes land soft, misses land nothing.
    Cover is real — trees, rocks and walls block shots.
  - **Contact is timing.** Gap-closing strikes whiff if the target slips out
    of reach ("TOO FAR" warns you first, nothing is spent on a hopeless
    swing). Strike INTO a telegraphed wind-up and you **interrupt** the
    attack entirely for bonus damage — but a whiffed swing leaves you
    **Exposed**, and the enemy's next hit lands ~1.3× harder.
  - **Your footwork is your defense.** Incoming hits run hot (~1.2×) by
    default — standing still is how you lose. Keep moving for a discount,
    dash *through* an attack for a **graze** (less than half damage), or
    sidestep entirely and take zero while the counter bell rings. Sleep and
    paralysis still bite: a sleeping body won't answer the controls.
  - **Species fight like themselves.** Space triggers your species'
    **signature dodge**: ghosts **Blink** through space, Abra's line
    **Teleports**, moles and rock bodies **Burrow** under attacks, birds
    **Swoop**, sea creatures **Dive** beneath the surface, heavies like
    Snorlax don't dodge at all — they **Brace** and soak it — and darty
    little things like Pikachu get rapid-fire dashes. The enemy uses the
    same arsenal against you.
  - **Moves duel mid-air.** Opposing projectiles that meet resolve like
    types do: **Water Gun douses Ember**, beams and bolts punch through
    lesser shots, Gust and Surf shove attacks off course, and near-even
    trades detonate between you. Lobbed gunk (Sludge, Acid, Bubble) leaves
    **hazard pools** that slow and sting anyone standing in them, and
    **Earthquake** rolls out as a ground shockwave — time a dash (or be
    airborne, burrowed, levitating) and it passes right under you.
  - **Experience is real.** A Lv50 veteran winds up faster, leads your
    movement when it shoots, groups its shots tighter, reacts to incoming
    fire sooner, picks smarter moves, and pushes in the moment you commit
    to an attack. Early-route hatchlings do none of this. The badge/IQ ramp
    (and the AI menu setting) stacks on top.
  - **Temperament shows.** The enemy nameplate carries a temper chip —
    *aggressive* species rush in close, *skittish* ones keep their distance
    and dodge more, *calm* ones hold their ground.
  - **No menu clunk.** Hold-click to aim a Ball and you flow back into the
    trainer's hands mid-motion; open the bag or switch and the same happens —
    then you dive straight back into your Pokémon after. T steps out
    deliberately whenever you'd rather call commands from the sidelines.
- **Terrain and weather still shape everything**: water boosts Water moves,
  rain weakens Fire and lets Thunder never miss, fog drops accuracy, caves
  empower Rock/Ground, electricity conducts through the pool your target is
  standing in...
- **Weather + caves.** Dynamic clear/rain/storm/fog with rain audio, thunder
  and lightning flashes. Caves are genuinely dark — stalactites, glowing
  mushrooms, dripping water, bats — bring the flashlight (L).
- **Fishing.** Face open water, cast the Old Rod (E), wait for the **"!"** and
  hook it for a water battle: Magikarp, Poliwag, Goldeen, Tentacool, Horsea,
  Slowpoke, Psyduck... zone-dependent.
- **Team Rocket.** Once you hold a badge, Jessie & James ambush you on the
  routes ("Prepare for trouble..."). Beat them and they blast off again —
  they always drop a **Nugget**.
- **The Champion.** With all eight badges, face the Champion — **your
  rival, wearing the name you gave him in Oak's lab** — at the Indigo
  Plateau. His team scales to yours and his ace counters your starter. Win
  for the fanfare, the confetti and your **Hall of Fame** entry (signed
  with your trainer name) — then the rematches scale up.
- **New items**: Oran/Razz Berries (pick them from roadside bushes), Repel,
  Lure, Escape Rope, Nugget.
- **All the Gen 1 core** from before: DVs + Stat Exp feeding the real stat
  formula, four growth curves, 165 moves with PP (Struggle when dry), Gen 1
  crit rates, first-strike battle openings, authentic encounter tables per
  zone, roaming legendaries (Articuno, Zapdos, Moltres, Mewtwo, Mew), the
  Gen 1 catch and payout formulas, all eight gym badges, and Cerulean Cave
  sealed until you hold every one of them.

## Cheats

Open **Esc → Open Cheats…**: God Mode, One-Hit KO, 100% Catch, Infinite PP,
Speed Boost, +money/Balls/items, Rare Candies, instant badges, full Pokédex
"seen", day/night, **weather control**, **summon Team Rocket**, max happiness,
**teleport to any landmark**, and **spawn any Pokémon by name at any level**.
Everything is also scriptable from the console via `DEBUG.*` (e.g.
`DEBUG.weather("storm")`, `DEBUG.rocket()`, `DEBUG.spawn(150, 70)`).

## How to play

1. Pick a **save file**, sit through Oak's intro (worth it), name yourself
   and your rival, then pick **Bulbasaur, Charmander or Squirtle** — and
   beat your rival's counter-pick outside the lab. You start with 5 Poké
   Balls and ₽600 — and your starter at your heels.
2. Weaken wilds in battle (F) before throwing; or skip the fight and trust
   your aim — held throws with good ring timing catch well above their
   weight. Skittish species flee, aggressive ones charge you. Feeling brave?
   Switch the **battle style** (Esc) to **First-Person** and fight as the
   Pokémon yourself — or to **Classic** for pure RBY turns.
3. Heal free at any **Pokémon Center** (sets your respawn), stock up at the
   **PokéMart**, pick berries on the routes, and pet your partner. Better
   Balls unlock as your Trainer Level rises.
4. Take the gyms in the classic order — **Brock, Misty, Lt. Surge, Erika,
   Koga, Sabrina, Blaine, Giovanni**. All eight badges unseal Cerulean Cave,
   and the **Champion** waits past Victory Road at the Indigo Plateau.

Progress auto-saves to `localStorage` every few seconds; old saves migrate
forward automatically (pre-story saves keep their progress and simply skip
the rival beats they've outgrown — slot 1 keeps the legacy storage key).

## Project layout

```
index.html        UI markup + styles (Vite entry)
src/main.ts       boot, first-person controller, input (aim/throw), game loop
src/world.ts      Kanto terrain, towns, caves, water, weather, day/night, berries, minimap
src/game.ts       stats/XP/PP, habitat spawning/AI (sky, water, trees, tall
                  grass), the three battle styles (classic turns / arena
                  real-time / first-person possession), spatial combat
                  (projectile duels, hazards, species skills, veteran AI),
                  catching 2.0, follower, fishing, Team Rocket, the story
                  (Oak intro, rival arc, save slots, civilians), Champion,
                  items, cheats, save

src/monmodel.ts   procedural 3D models + animators for all 151 species
src/fx.ts         particle engine, move animations, aim arc/ring, celebrations
src/ui.ts         HUD, Pokédex, bag, party, PC, shop, dialogs, Hall of Fame, cheats
src/audio.ts      synthesized WebAudio SFX, species cries, rain/thunder, ambience
src/data.js       GENERATED Gen 1 data (151 Pokémon, 165 moves, PP, growth, types)
src/data.d.ts     hand-written types for the generated data
public/sprites/   all 302 official sprites — used by the 2D UI only
tools/generate_data.py   regenerates src/data.js (needs internet)
tools/e2e-test.mjs       headless-browser smoke test (107 checks)
tools/offline-probe.mjs  proves the game runs with all external requests blocked
tools/gallery-shot.mjs   screenshots every 3D model in batches for review
tools/possess-shot.mjs   possession-mode diagnostic (take over, move, fire, eject)
tools/story-shot.mjs     walks the real intro path (title → Oak → naming →
                         lab battle → phone zombies → PokéGram) with screenshots
tools/habitat-shot.mjs   habitat showcase (birds aloft, swimmers, canopy
                         perchers, the swoop-down battle, mid-air catches)
tools/battle-stress.mjs  battle-mechanics stress probe (all three styles:
                         missed-ball turns, menu gating, trainer fights,
                         forced switches — fails on any stuck state)
screenshots/      captured by the e2e test
```
