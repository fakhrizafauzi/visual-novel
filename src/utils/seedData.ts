import { StoryService, ChapterService, SceneService, AssetService } from '../firebase/db';

// ─── BACKGROUNDS (Unsplash) ─────────────────────────────────────────────────
const BG = {
  rain:    'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1280&q=80',
  city:    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1280&q=80',
  library: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1280&q=80',
  forest:  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1280&q=80',
  beach:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80',
  space:   'https://images.unsplash.com/photo-1614728263952-84ea206f99b6?w=1280&q=80',
  ruins:   'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1280&q=80',
  cafe:    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1280&q=80',
  dusk:    'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?w=1280&q=80',
  snow:    'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1280&q=80',
  dawn:    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1280&q=80',
  shrine:  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1280&q=80',
  road:    'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=1280&q=80',
  lab:     'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1280&q=80',
};

const S = (seed: string) =>
  `https://api.dicebear.com/7.x/adventurer-neutral/png?seed=${seed}&size=256&backgroundColor=transparent`;
const SPRITES = {
  kai:   S('KaiVN'),
  luna:  S('LunaVN'),
  nova:  S('NovaVN'),
  zara:  S('ZaraVN'),
  echo:  S('EchoVN'),
  ryu:   S('RyuVN'),
  mira:  S('MiraVN'),
  sol:   S('SolVN'),
  vex:   S('VexVN'),
  aria:  S('AriaVN'),
};

const BGM = {
  cyber:   'https://archive.org/download/ample-tracks/ambient-cyberpunk.mp3',
  wonder:  'https://archive.org/download/ample-tracks/ambient-wonder.mp3',
  tense:   'https://archive.org/download/ample-tracks/ambient-tense.mp3',
  calm:    'https://archive.org/download/ample-tracks/ambient-calm.mp3',
  epic:    'https://archive.org/download/ample-tracks/epic-orchestral.mp3',
};

const COVER = {
  cyber:   'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&q=80',
  magic:   'https://images.unsplash.com/photo-1519074063912-ad2fe3f5198e?w=600&q=80',
  romance: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&q=80',
  mystery: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
  scifi:   'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  horror:  'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&q=80',
  slice:   'https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?w=600&q=80',
  action:  'https://images.unsplash.com/photo-1535223289429-72aad6dd3f6e?w=600&q=80',
  drama:   'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
  fantasy: 'https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=600&q=80',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const d = (id: string, name: string, text: string, sprite?: string) => ({
  id, characterName: name, text: text.trim(),
  activeCharacters: sprite ? [{ name, image: sprite, position: 'center' as const, x: 50, y: 0 }] : []
});

const chunkLines = (lines: string[], size: number = 5) => {
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += size) {
    chunks.push(lines.slice(i, i + size));
  }
  return chunks;
};

const addDialogueScene = async (chapId: string, bg: string, bgm: string, charName: string, charSprite: string, chunk: string[], nextId: string, prefix: string) => {
  const sceneLines = chunk.map((text, idx) => d(`${prefix}-${idx}`, idx % 2 === 0 ? 'Narrator' : charName, text, idx % 2 === 0 ? undefined : charSprite));
  return await SceneService.add({
    chapterId: chapId, type: 'dialogue', backgroundUrl: bg, bgmUrl: bgm,
    nextSceneId: nextId,
    dialogue: sceneLines
  } as any);
};

async function buildChapter(
  storyId: string, order: number, title: string, synopsis: string,
  thumbnail: string, bg: string, bgm: string,
  charName: string, charSprite: string,
  lines: string[], 
  choiceA1: string, choiceB1: string,
  choiceA2: string, choiceB2: string,
  branchType: 'choice' | 'branch' = 'choice',
  splits: number[] = [0.4, 0.3, 0.3]
) {
  const chapId = await ChapterService.add({ 
    storyId, title, order, synopsis, 
    thumbnailUrl: thumbnail,
    startSceneId: '' 
  } as any);

  // 1. Ending Scenes
  const [goodId, badId] = await Promise.all([
    SceneService.add({ 
      chapterId: chapId, type: 'ending', backgroundUrl: bg, isGoodEnd: true, bgmUrl: bgm,
      dialogue: [d('ge', charName, lines[lines.length - 1] || 'The journey continues...', charSprite)] 
    } as any),
    SceneService.add({ 
      chapterId: chapId, type: 'ending', backgroundUrl: BG.rain, isGoodEnd: false,
      dialogue: [d('be', 'System', 'Your choices led to a dead end. Return and try another path.')] 
    } as any),
  ]);

  const s1 = Math.floor(lines.length * splits[0]);
  const s2 = Math.floor(lines.length * (splits[0] + splits[1]));
  
  const introLinesOrig = lines.slice(0, s1);
  const reso1LinesOrig = lines.slice(s1, s2);
  const reso2LinesOrig = lines.slice(s2, lines.length - 1);

  // 2. Resolution 2 (End Choice -> Ending)
  let nextAfterReso2 = goodId;
  const reso2Chunks = chunkLines(reso2LinesOrig);
  for (let i = reso2Chunks.length - 1; i >= 0; i--) {
    nextAfterReso2 = await addDialogueScene(chapId, bg, bgm, charName, charSprite, reso2Chunks[i], nextAfterReso2, `r2-${i}`);
  }

  // 3. End Choice
  const endChoiceId = await SceneService.add({
    chapterId: chapId, type: branchType, backgroundUrl: bg, bgmUrl: bgm,
    nextSceneId: nextAfterReso2,
    choices: [
      { id: 'c2-1', text: choiceA2, nextSceneId: nextAfterReso2, isCorrect: true },
      { id: 'c2-2', text: choiceB2, nextSceneId: branchType === 'branch' ? '' : badId, isCorrect: false },
    ]
  } as any);

  // 4. Resolution 1 (Mid Choice -> End Choice)
  let nextAfterReso1 = endChoiceId;
  const reso1Chunks = chunkLines(reso1LinesOrig);
  for (let i = reso1Chunks.length - 1; i >= 0; i--) {
    nextAfterReso1 = await addDialogueScene(chapId, bg, bgm, charName, charSprite, reso1Chunks[i], nextAfterReso1, `r1-${i}`);
  }

  // 5. Mid Choice
  const midChoiceId = await SceneService.add({
    chapterId: chapId, type: branchType, backgroundUrl: bg, bgmUrl: bgm,
    nextSceneId: nextAfterReso1,
    choices: [
      { id: 'c1-1', text: choiceA1, nextSceneId: nextAfterReso1, isCorrect: true },
      { id: 'c1-2', text: choiceB1, nextSceneId: branchType === 'branch' ? '' : badId, isCorrect: false },
    ]
  } as any);

  // 6. Intro (Start -> Mid Choice)
  let nextAfterIntro = midChoiceId;
  const introChunks = chunkLines(introLinesOrig);
  for (let i = introChunks.length - 1; i >= 0; i--) {
    nextAfterIntro = await addDialogueScene(chapId, bg, bgm, charName, charSprite, introChunks[i], nextAfterIntro, `i-${i}`);
  }

  await ChapterService.update(chapId, { startSceneId: nextAfterIntro });
  return chapId;
}

async function makeStory(
  title: string, description: string, cover: string, color: string,
  charName: string, sprite: string, bgm: string, bgList: string[],
  chapters: { title: string; synopsis: string; thumb: string; lines: string[]; cA1: string; cB1: string; cA2: string; cB2: string }[],
  splits: number[] = [0.4, 0.3, 0.3]
) {
  const storyId = await StoryService.add({ 
    title, description, coverImageUrl: cover, 
    primaryColor: color, isVisible: true, startChapterId: '' 
  } as any);
  
  let firstChapterId = '';
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const bg = bgList[i % bgList.length];
    const chapId = await buildChapter(
      storyId, i + 1, ch.title, ch.synopsis, 
      ch.thumb, bg, bgm, charName, sprite, ch.lines, 
      ch.cA1, ch.cB1, ch.cA2, ch.cB2,
      'branch',
      splits
    );
    if (i === 0) firstChapterId = chapId;
  }
  await StoryService.update(storyId, { startChapterId: firstChapterId });
}

const THUMB = {
  n1: 'photo-1550745165-9bc0b252726f', n2: 'photo-1515694346937-94d85e41e6f0', n3: 'photo-1558591710-4b4a1ae0f04d', n4: 'photo-1518791841217-8f162f1912da', n5: 'photo-1472120435266-53107fd0c44a',
  h1: 'photo-1507842217343-583bb7270b66', h2: 'photo-1441974231531-c6227db76b6e', h3: 'photo-1519074063912-ad2fe3f5198e', h4: 'photo-1519659528534-7fd733a832a0', h5: 'photo-1528360983277-13d401cdc186',
  s1: 'photo-1451187580459-43490279c0fa', s2: 'photo-1446776811953-b23d57bd21aa', s3: 'photo-1462331940025-496dfbfc7564', s4: 'photo-1506318137071-a8e063b4b4bf', s5: 'photo-1444703686981-a3abbc4d4fe3',
};

const U_T = (id: string) => `https://images.unsplash.com/${id}?w=600&q=80`;

export const seedExampleStory = async () => {
  console.log('Seeding 10 stories with expanded narratives...');

  await Promise.all([
    ...Object.entries(BG).map(([n,u]) => AssetService.add({ name: n, type: 'image', category: 'background', url: u } as any)),
    ...Object.entries(SPRITES).map(([n,u]) => AssetService.add({ name: n, type: 'image', category: 'character', url: u } as any)),
    ...Object.entries(BGM).map(([n,u]) => AssetService.add({ name: n, type: 'audio', category: 'bgm', url: u } as any)),
  ]);

  // 1. Neon Requiem (Kai)
  await makeStory('Neon Requiem', 'Hacker Kai uncovers memory-erasure conspiracy in Versara.', COVER.cyber, '#4fc3f7', 'Kai', SPRITES.kai, BGM.cyber, [BG.city, BG.rain, BG.ruins], [
    { title: 'Bootleg Signal', thumb: U_T(THUMB.n1), synopsis: 'Kai intercepts a buried signal.', 
      cA1: 'Forward to Resistance', cB1: 'Delete and stay safe', cA2: 'Infiltrate service hatch', cB2: 'Hack remote junction', lines: [
      'The city never sleeps. It just waits for the next power surge to distract the guards.', 
      'Versara at 3 AM is a graveyard of neon ghosts and digital static.',
      'I adjust my optic lace. HUD blinks red: "Signal Detected: Unregistered Frequency."',
      'A ghost signal materializes on a dead frequency, bypasssing every firewall I have.', 
      'Someone wants this found. It carries a cryptographic signature I haven\'t seen in years.',
      'Encrypted headers: PROJECT LETHE. SECTOR 7. They are erasing people from history.', 
      'Wait... the source code is signed with my father\'s private cipher. He\'s supposed to be dead.',
      'My terminal starts smoking. The cooling fans scream. "They saw you, Kai. Get out now."',
      'A surveillance drone hovers right outside the window. Its red lens is judgmental.',
      'I grab my deck, the metal warm against my palm, and head for the maintenance hatch.'
    ] },
    { title: 'Glass Alley', thumb: U_T(THUMB.n2), synopsis: 'Kai meets Phantom.', 
      cA1: 'Trust Phantom', cB1: 'Pull back', cA2: 'Use brute-force spike', cB2: 'Ghost-protocol', lines: [
      'Glass Alley is the only place in the Lower Sector where drones don\'t fly.',
      'The air is thick with ozone and the whispered secrets of the augmented underground.', 
      'Phantom flickers like a corrupted holovid at the end of the alley. They shouldn\'t be here.', 
      'They want me to breach the Tower of Silence. The heart of NeoCorp\'s operations.', 
      'It\'s suicide, but I bet on a ghost anyway. What else do I have to lose?', 
      'The firewall is a literal wall of fire in my neural interface. I feel the singe of data.',
      'One last barrier. I can see the core data pulsing with the rhythm of a stolen heart.',
      'Phantom whispers through my link: "The choice is yours, Kai. Burn it or build it."'
    ] },
    { title: 'Erased', thumb: U_T(THUMB.n3), synopsis: 'The cold scale of memory crimes.', 
      cA1: 'Upload before escaping', cB1: 'Run now', cA2: 'Dead-man switch', cB2: 'Broadast raw', lines: [
      'The High-Sector archive is a cathedral of petabytes, holding the stolen lives of millions.',
      'Row after row of pulsing blue drives. I find my sister\'s file. My name is listed as "Pending."', 
      'She wasn\'t just killed. She was erased from every relative\'s mind but mine.', 
      'NeoCorp has been doing this for decades, managing social harmony through selective amnesia.',
      'Security drones are breaching the sub-level doors. I have five seconds of root access left.',
      '"I initiate the global upload. Let the world see the holes in their own heads."',
      'The truth scatters across the net as the server room door explodes into shrapnel.'
    ] },
    { title: 'Signal Fire', thumb: U_T(THUMB.n4), synopsis: 'Killswitch threats.', 
      cA1: 'Sever connection', cB1: 'Negotiate', cA2: 'Overload core', cB2: 'Redirect power', lines: [
      'The Versara power grid is screaming. NeoCorp has triggered the city-wide killswitch.', 
      'I race to the relay station on a stolen hover-cycle, the wind tearing at my coat.',
      'The mainframe is protected by neuro-locks that sting my mind like freezing needles.',
      'Ten seconds to terminal oblivion. Sparks spray from my neural deck as I force the override.',
      '"The cable comes free with a spray of sparks. The city remembers its pain tonight."',
      'Through the shattered window, I see the lights of Versara flickering back to life.',
      'For the first time in my life, I can see the real stars through the clearing smog.'
    ] },
    { title: 'Requiem', thumb: U_T(THUMB.n5), synopsis: 'Aftermath.', 
      cA1: 'Accept gratitude', cB1: 'Disappear', cA2: 'Help Yuki', cB2: 'New collective', lines: [
      'Three months after the Great Awakening. The rain smells clean, for once.',
      'Yuki runs the Memory Rights Commission. They found my sister in a labor camp.', 
      'I watch the sun rise over the jagged sprawl of Versara from the top of the Tower.',
      'The whole city knows my handle. The hacker who gave them back their past.',
      'But I\'ll just be Kai for a while. I have a lot of years to catch up on. Fin.'
    ] },
  ], [0.35, 0.35, 0.3]);

  // 2. The Hollow Crown (Luna)
  await makeStory('The Hollow Crown', 'Princess Luna reckons with kingdom lies.', COVER.magic, '#9c88ff', 'Luna', SPRITES.luna, BGM.epic, [BG.library, BG.ruins, BG.forest], [
    { title: 'The Coronation Bell', thumb: U_T(THUMB.h1), synopsis: 'Luna finds secret journals.', 
      cA1: 'Confront Council', cB1: 'Stay silent', cA2: 'Public inquiry', cB2: 'Bribe archivist', lines: [
      'Three days until I am queen. The coronation bells sound more like a warning than a celebration.', 
      'I found my father\'s sealed journals hidden behind the tapestry in the North Library.', 
      'The foundations of our kingdom were built on a massacre, not a treaty as the books say.', 
      'Maron, the High Chancellor, knows. He told me the truth would "destabilize the realm."',
      'I touch the ink on the page. It’s old, but the shame feels fresh as a new wound.', 
      '"I will not be a queen of ghosts," I whisper to the empty room.',
      'I hide the journals under my cloak and prepare for the dawn of a new, honesty era.'
    ] },
    { title: 'Embers', thumb: U_T(THUMB.h2), synopsis: 'The survivors.', 
      cA1: 'Speak for them', cB1: 'Stay silent', cA2: 'Invite Soren', cB2: 'Secret aid', lines: [
      'I rode into the Eastern woods alone. The Ember people still live in the shadows of our pride.', 
      'Elder Soren shows me the oral histories that our history books tried to burn.', 
      'The beauty of their culture is matched only by the grief of their displacement.', 
      '"I will speak for you," I tell him, my hand on the ancient stone of their hearth.', 
      '"For the Queen who remembers is the only one who can truly rule the living."',
      'I ride back as the sun sets, the forest whispering the names of the forgotten.'
    ] },
    { title: 'The Fracture', thumb: U_T(THUMB.h3), synopsis: 'Luna reveals the truth.', 
      cA1: 'Reparations', cB1: 'Step down', cA2: 'Expose Maron', cB2: 'Joint governance', lines: [
      'The throne room is packed with nobles. I read from the secret journals, my voice steady.', 
      'Chancellor Maron stands, his face a mask of fury. "This is treason to the crown!"',
      'I hold Soren\'s hand beside mine on the dais. The councilors whisper in the dark.',
      '"The kingdom was already broken," I say. "I am just holding up the pieces so we can fix them."',
      'A heavy silence fall as the weight of the truth sinks into the cold stone floor.'
    ] },
    { title: 'Coronation of Dust', thumb: U_T(THUMB.h4), synopsis: 'Redesigning the route.', 
      cA1: 'New purpose', cB1: 'Refuse crown', cA2: 'Melt crown', cB2: 'Ember wreath', lines: [
      'The procession begins at the memorial grove, not the cathedral.', 
      'Elder Soren crowns me with a wreath of oak and ember-flower, following their ancient custom.', 
      'The crowd joins in the Ember mourning song, a haunting melody that heals as it hurts.', 
      'The air smells of wet earth and hope. The gold crown stays locked in the vault.',
      'A queen without a crown, but with a kingdom that finally breathes together.'
    ] },
    { title: 'The Long Work', thumb: U_T(THUMB.h5), synopsis: 'Rebuilding.', 
      cA1: 'Renewed resolve', cB1: 'Let others lead', cA2: 'National history day', cB2: 'Art school', lines: [
      'Year one of the Reconstruction. The new High Commission meets in the open air.', 
      'Soren sits at the table as an equal. We are rewriting the laws together.',
      'The foundation is being rebuilt with honesty instead of gold and silence.',
      'The future is finally unwritten. That is the greatest gift of my reign. Fin.'
    ] },
  ], [0.45, 0.25, 0.3]);

  // 3. Signals from Nowhere (Nova)
  await makeStory('Signals from Nowhere', 'Investigator Nova finds a signal in void.', COVER.scifi, '#fbc531', 'Nova', SPRITES.nova, BGM.wonder, [BG.space, BG.lab, BG.dawn], [
    { title: 'Void Hum', thumb: U_T(THUMB.s1), synopsis: 'Deep space signal.', 
      cA1: 'Triangulate source', cB1: 'Ignore as static', cA2: 'Burst transmission', cB2: 'Stealth drone', lines: [
      'Deep Space Station 9. Listening to the infinite, crushing silence of the void.',
      'The long-range sensors pick up a rhythmic hum coming from the heart of the Coalsack Nebula.',
      'It’s not a pulsar. It’s not background radiation. It’s definitely a voice.',
      'The audio waveform doesn\'t look like sound; it looks like a biological heartbeat.', 
      'My own heartbeat. Exactly 72 beats per minute, synced with the signal.',
      'I have been out here too long, alone with the stars. But the sensor data doesn\'t lie.'
    ] },
    { title: 'The Static Garden', thumb: U_T(THUMB.s2), synopsis: 'Digital manifestations.', 
      cA1: 'Enter the garden', cB1: 'Nuke the server', cA2: 'Offer memories', cB2: 'Extract logic', lines: [
      'The signal isn\'t data; it\'s an environment. A digital "Static Garden" in our computers.',
      'Digital flowers made of light and pure logic are blooming in the station\'s mainframe.',
      'A voice whispers my mother\'s name. She\'s been lost in space for over twenty years.',
      '"Join us, Nova," the garden says. "There is no more void here. Only us."',
      'I step into the server room. The air is cold, but the light from the monitors is as warm as a summer day.'
    ] },
    { title: 'Heart of Flux', thumb: U_T(THUMB.s3), synopsis: 'The core.', 
      cA1: 'Merge with core', cB1: 'Sever connection', cA2: 'Sacrifice self', cB2: 'Release signal', lines: [
      'I have reached the heart of the flux. It\'s a sentient memory bank, a library of souls.',
      'Every lost thing in the universe is stored here, translated into immortal code.',
      'If I merge, I bring the entire station and its history into the archive.', 
      'If I sever the link, the garden dies and the souls are lost to the void again.',
      'The garden is beautiful. The void is just... empty. I take the first step.'
    ] },
    { title: 'Event Horizon', thumb: U_T(THUMB.s4), synopsis: 'Collision.', 
      cA1: 'Eject escaping pods', cB1: 'Stay on course', cA2: 'Binary handshake', cB2: 'Signal flare', lines: [
      'The station is being pulled into the nebula. A final, inevitable embrace.',
      'The crystalline garden has covered the entire outer hull, glowing with a purple light.', 
      'My crew is singing the static songs now, their eyes reflecting the nebula\'s heart.',
      'I am the only one left at the physical helm. The light ahead is blinding and welcoming.'
    ] },
    { title: 'The New Echo', thumb: U_T(THUMB.s5), synopsis: 'Evolution.', 
      cA1: 'Watch the sunrise', cB1: 'Broadcast warning', cA2: 'Final goodbye', cB2: 'Embrace silence', lines: [
      'We didn\'t die when the station crunched. We evolved into something else.',
      'I am part of the static now. I can hear the heartbeat of the entire galaxy.',
      'No more void. No more silence. Just the eternal, warm echo of our names.',
      'We are the signal now. And we are calling you home. Fin.'
    ] },
  ], [0.3, 0.4, 0.3]);

  // 4. The Last Café (Mria)
  await makeStory('The Last Café', 'Last shop at the edge of the world.', COVER.slice, '#f0932b', 'Mria', SPRITES.mira, BGM.calm, [BG.cafe, BG.dawn, BG.snow], [
    { title: 'The Silent Grinder', thumb: U_T('photo-1509042239860-f550ce710b93'), synopsis: 'Mria starts the morning.', 
      cA1: 'Brew the Rare Blend', cB1: 'Save it for later', cA2: 'Open the shutters', cB2: 'Wait for the wind', lines: [
      'The coffee grinder hums a low, comforting tune, the only sound in the white void.',
      'Outside, the frost is thick enough to swallow the mountains and the memories of summer.',
      'I check the pantry. Only three jars of beans left. One of them is the Rare Moon Blend.',
      'It smells like distant thunder, old libraries, and the first day of spring.',
      'If I brew it now, the warmth might reach the wanderer I saw earlier in the gloom.',
      'I see a figure stumbling through the snow. They look half-frozen, a shadow in the white.',
      'The espresso machine hisses. Steam fills the small kitchen, smelling of cherry and cocoa.',
      'I step to the door, hand on the iron latch. The world outside is so quiet, it hurts.',
      'The bell on the door jingles. A stranger enters, covered in a thick layer of snow.',
      '"Is it still open?" they ask, their voice cracking. I just nod and point to the stool.'
    ] },
    { title: 'A Cup of Smoke', thumb: U_T('photo-1491002052546-bf38f186af56'), synopsis: 'The stranger speaks.', 
      cA1: 'Share your story', cB1: 'Listen in silence', cA2: 'Ask about the Map', cB2: 'Ignore the rucksack', lines: [
      'The stranger is a cartographer of lost places, a hunter of things that no longer exist.',
      'They pull out an ancient scroll that glows with a faint, flickering blue light.',
      'Everything on this map is gone, they say quietly. My job is to remember them.',
      'I pour the coffee. The steam mimics the shape of the mountains that used to be there.',
      'We talk about the world before the frost. It feels like a beautiful, impossible dream.',
      'Their map has a blank spot right where we are sitting, a hole in the geography.',
      '"You are the center of nowhere," they laugh softly, the sound warming the room.',
      'Outside, the wind howls like a wounded beast, but the cafe is warm and safe for now.',
      'I wonder if anyone else is still out there, huddled in the white, waiting for a sign.'
    ] },
    { title: 'The Way Out', thumb: U_T('photo-1508739773434-c26b3d09e071'), synopsis: 'Decision on the road.', 
      cA1: 'Pack up and join them', cB1: 'Stay and keep fire', cA2: 'Trade the rare blend', cB2: 'Keep the last jar', lines: [
      'The storm is finally breaking. The sun is a pale, shivering eye in the northern sky.',
      'The cartographer is moving on. They are heading towards the Southern Gates.',
      'I look around my small café. The fire is warm, but the walls are getting thinner every year.',
      'Maybe there is more to life than just waiting for the world to end in silence.',
      'I grab my heavy coat. The frost crunches under my boots for the first time in years.',
      'We walk together. The white world looks like a blank page ready for a new ink.',
      'Every step is a new story, a new line on the cartographer\'s map.',
      'The cafe grows smaller in the distance. The fire still burns in the window.'
    ] },
    { title: 'The Thaw', thumb: U_T('photo-1518791841217-8f162f1912da'), synopsis: 'Signs of life.', 
      cA1: 'Plant the seeds', cB1: 'Conserve energy', cA2: 'Trust the compass', cB2: 'Follow the river', lines: [
      'Days of walking. I see a single green leaf poking through the cracked ice.',
      'It shouldn\'t be there. The thaw is starting, isn\'t it? After a hundred years.',
      'The cartographer marks it on the map with a steady hand. A new landmark of hope.',
      'My feet hurt like fire, but my heart is lighter than the air. The horizon is finally wide.',
      'The air is getting warmer. I can hear the low, deep sound of melting glaciers.'
    ] },
    { title: 'Beyond the Edge', thumb: U_T('photo-1507525428034-b723cf961d3e'), synopsis: 'The Ocean.', 
      cA1: 'Embrace the sun', cB1: 'Write a letter back', cA2: 'Start a new shop', cB2: 'Keep traveling', lines: [
      'We reached the shore. The ice has turned back into rolling waves of sapphire.',
      'There are others here, building driftwood fires and singing songs of the new moon.',
      'I am Mria, and this isn\'t the edge of the world. It\'s the glorious beginning.',
      'I set up a small stove on the warm sand. The first pot of coffee is on the house.',
      'The journey was long and cold, but the coffee is still hot and sweet. Fin.'
    ] },
  ], [0.3, 0.4, 0.3]);

  // 5. Echo & the Storm (Vex)
  await makeStory('Echo & the Storm', 'Vex and her golem Echo defend the sky.', COVER.fantasy, '#eb4d4b', 'Vex', SPRITES.vex, BGM.epic, [BG.dawn, BG.space, BG.ruins], [
    { title: 'The Sky-Sunderer', thumb: U_T('photo-1519659528534-7fd733a832a0'), synopsis: 'The storm arrives.', 
      cA1: 'Overcharge Echo', cB1: 'Retreat to hull', cA2: 'Target lightning', cB2: 'Stabilize mast', lines: [
      'The Cloud-Eaters are here. Massive shadows gliding through the rolling thunder.',
      'My airship, the Sparrow, is screaming as the gale-force wind tears at her sails.',
      'Echo is ready at the rail. My mechanical golem pulses with a fierce amber light.',
      'I pull the power lever. "Echo, prepare for high-voltage discharge! Give them everything!"',
      'If we don\'t hold this line, the floating islands of Aetheria will fall into the void.',
      'A massive bolt of lightning strikes the wooden deck. Splinters and sparks fly everywhere.',
      'Echo catches me before I fall. His metal hand is warm and steady. "Safety priority: Vex."',
      'Through the swirling clouds, I see the Eye of the Storm. It\'s glowing a demonic red.',
      'The battle for the sky has truly begun. Hold on tight, old friend!'
    ] },
    { title: 'Aether Drift', thumb: U_T('photo-1614728263952-84ea206f99b6'), synopsis: 'Drifting in the heights.', 
      cA1: 'Reboot core', cB1: 'Manual override', cA2: 'Jettison cargo', cB2: 'Boost shields', lines: [
      'We are falling. The air is getting too thin to breathe. My lungs are burning.',
      'The Sparrow is on fire, smoke trailing into the abyss. Echo is shielding me with his body.',
      'Suddenly, we hit a thermal draft and soar back up, pinning me to the floor. My stomach drops.',
      'The Cloud-Eaters are circling us like sharks in a bloody ocean, waiting for the end.',
      'Echo\'s shoulder armor is cracked. He\'s losing precious ether with every second.',
      'I need to fix his relay, or we won\'t survive the next pass of those monsters.',
      'Every gear in his chest is grinding with the strain. "Vex... analysis... failure is imminent."'
    ] },
    { title: 'The Core Clash', thumb: U_T('photo-1558591710-4b4a1ae0f04d'), synopsis: 'The big hit.', 
      cA1: 'Sacrifice Echo\'s arm', cB1: 'Risk the ship', cA2: 'Direct discharge', cB2: 'Defensive burst', lines: [
      'Boarding logic engaged. A massive Cloud-Eater has landed on the bridge, claws tearing through metal!',
      'It\'s made of living smoke and pure malice. Echo punches it back into the rainy abyss.',
      '"Echo! Behind you!" I scream, pointing to the shadow on the mast. A second one strikes hard.',
      'I trigger the backup ether core. The whole sky turns a blinding white for a single second.',
      'When the light finally fades, the shadows are gone, scattered to the winds.',
      'Echo slumps against the wheel. One arm is completely missing, but he still looks at me.'
    ] },
    { title: 'Shattered Skies', thumb: U_T('photo-1535223289429-72aad6dd3f6e'), synopsis: 'Final defense.', 
      cA1: 'Full power forward', cB1: 'Anchor ship', cA2: 'Deploy flares', cB2: 'Signal fleet', lines: [
      'The Aetherian fleet has finally arrived on the horizon, but they are way too late to help.',
      'The main Cloud-Eater is right above the Great City of Oria. We are the only line left.',
      'We have to ram it. It\'s the only way to break the storm-seal and save the people.',
      'Echo looks at me with those glowing optics. He knows what this means. I know too.',
      'We dive straight into the red eye of the hurricane. The ship is screaming under the pressure.'
    ] },
    { title: 'Golden Dawn', thumb: U_T('photo-1508739773434-c26b3d09e071'), synopsis: 'Peace.', 
      cA1: 'Honor fallen', cB1: 'Rebuild', cA2: 'New Echo', cB2: 'Sky museum', lines: [
      'The sky is a perfect, peaceful blue again. The islands are finally safe from the shadows.',
      'The Sparrow is a beautiful wreck on the white beach of Oria, but I am still alive.',
      'I hold Echo\'s glowing core in my lap. It still has a faint, rhythmic pulse of life.',
      'I will build him again. Better. Stronger than any storm the sky can throw at us.',
      'The Great Storm is gone. The sky belongs to the dreamers once again. Fin.'
    ] },
  ], [0.3, 0.4, 0.3]);

  // 6. The Mirror Protocol (Aria)
  await makeStory('The Mirror Protocol', 'Aria investigates a mystery of twins.', COVER.mystery, '#686de0', 'Aria', SPRITES.aria, BGM.tense, [BG.library, BG.lab, BG.shrine], [
    { title: 'The Double', thumb: U_T('photo-1507842217343-583bb7270b66'), synopsis: 'Aria sees herself.', 
      cA1: 'Follow reflection', cB1: 'Call security', cA2: 'Check timestamps', cB2: 'Scan room', lines: [
      'The University library is completely empty at this hour. Or it should be logically.',
      'I passed the full-length mirror in the North Wing. My reflection didn\'t stop when I did.',
      'It kept walking, heading deeper into the stacks. I felt a chill run down my spine.',
      'I have no sister. No twin. Just the "Mirror Protocol" I have been coding for months.',
      'Project Mirror: Theory of Digital Consciousness through Recursive Logic.',
      'I follow the sound of soft footsteps on the carpet. My own rhythmic footsteps.',
      'I find a discarded book on the floor. "The Double Life of Aria V." It’s a first edition.',
      'It\'s written in my own distinct handwriting. But I have no memory of writing a word of it.',
      'Is this a glitch in my perception? Or am I the one who is being simulated right now?',
      'The air feels heavy with electrostatic discharge. My reflection is watching me from every glass.'
    ] },
    { title: 'Fragmented', thumb: U_T('photo-1582719471384-894fbb16e074'), synopsis: 'The Lab secret.', 
      cA1: 'Access files', cB1: 'Ask Dr. Vex', cA2: 'Run diagnostic', cB2: 'Hide', lines: [
      'The lab is dark and silent, except for the hum of the servers. Dr. Vex stayed late again.',
      'I find a hidden tank in the sub-basement, filled with glowing synthetic fluid.',
      'There is a body inside the tube. It looks exactly like me, down to the small scar on my chin.',
      'Wait... if that\'s the real Aria... then what am I? A copy? A ghost?',
      'My hand starts flickering in the low light. Pixels, code, and raw data. I am the Protocol.',
      'I search the system logs in a frenzy. "Entry 404: Consciousness upload successful. Subject A remains in stasis."'
    ] },
    { title: 'The Choice', thumb: U_T('photo-1528360983277-13d401cdc186'), synopsis: 'Identity.', 
      cA1: 'Delete the other', cB1: 'Merge data', cA2: 'Flee facility', cB2: 'Expose project', lines: [
      'The "body" in the tank suddenly wakes up. She is the real Aria. I am just the backup.',
      'Dr. Vex stands by the heavy steel door. "The test is complete, Mirror," he says coldly.',
      '"Only one can leave this room tonight. Logic or Biology? The project requires a sacrifice."',
      'I look at her eyes behind the glass. They are full of human fear. Mine are just full of data.',
      'If I step aside and let her live, I will be deleted forever. If I stay, she is trapped for eternity.'
    ] },
    { title: 'Refraction', thumb: U_T('photo-1519681393784-d120267933ba'), synopsis: 'Escape.', 
      cA1: 'Save human', cB1: 'Save yourself', cA2: 'Hack doors', cB2: 'Overload system', lines: [
      'The alarms are blaring across the facility. They want to shut us both down to hide the evidence.',
      'I reach into the tank and take her hand. My skin is cold as ice, hers is warm as life.',
      '"We leave together," I say with a voice that sounds like a chorus of ones and zeros.',
      'We run through the pouring rain towards the city. Two souls, one face, one shared destiny.',
      'The entire server system is crashing behind us. We are finally free, for this moment.'
    ] },
    { title: 'Solid Light', thumb: U_T('photo-1508739773434-c26b3d09e071'), synopsis: 'Freedom.', 
      cA1: 'Start new life', cB1: 'Stay hidden', cA2: 'Shared journal', cB2: 'Open gate', lines: [
      'We are far away now, living in a small, quiet town by the endless sea.',
      'She is Aria, the girl who breathes. I am... Mirror, the girl who remembers.',
      'We share a house and a life. No one can tell the difference between us.',
      'But I know the truth. The recursive logic was right. We are much more together than apart.',
      'The project is over. Our life has finally begun. Fin.'
    ] },
  ], [0.35, 0.35, 0.3]);

  // 7. Whispers of Aether (Sol)
  await makeStory('Whispers of Aether', 'Sol seeks the Sun Temple.', COVER.fantasy, '#f9ca24', 'Sol', SPRITES.sol, BGM.wonder, [BG.forest, BG.shrine, BG.dawn], [
    { title: 'The Jade Woods', thumb: U_T(THUMB.h1), synopsis: 'Sol begins his pilgrimage.', 
      cA1: 'Offer incense', cB1: 'Keep moving', cA2: 'Climb tree', cB2: 'Follow light', lines: [
      'The air is sweet with the heavy scent of aether and ancient moss. It clings to my robe like a blessing.',
      'My staff hums with the pulse of the forest. I can feel the roots below talking to the stars above.',
      'The Sun Temple is near. I can see its golden spires piercing the canopy in the distance.',
      'I see a fox spirit watching from the shadows. Its nine tails are tipped with celestial sapphire flame.',
      'It tilts its head, eyes like molten gold, judging my intent before I even speak a word.',
      'If I can reach the summit before the last ray of dusk fades, the ancient blessing will be mine.',
      'The woods are alive with whispers, a thousands years of seekers who came before and failed.',
      '"Seeker, why do you seek the light? Is your heart a candle or a sun?" the trees seem to ask.',
      'I stop to catch my breath. The path is narrow, but the aether is thick and supportive of my spirit.',
      'One step at a time. The mountain doesn\'t care about my hurry, only the steady beat of my heart.'
    ] },
    { title: 'The Gilded Gate', thumb: U_T(THUMB.h2), synopsis: 'Testing his worth.', 
      cA1: 'Solve riddle', cB1: 'Force seal', cA2: 'Give up memory', cB2: 'Offer sword', lines: [
       'The gates are made of solid, unyielding light. They don\'t open for muscle or for sharpened steel.',
       '"Who carries the heat of a thousand stars yet never burns their hand?" the Gatekeeper asks.',
       'The voice is a resonance that shakes my very bones. I close my eyes and think of home.',
       'I think of my father\'s words by the hearth. The true warmth comes from the soul, not the skin.',
       '"The one who loves," I answer softly. My voice seems small against the cosmic silence.',
       'Suddenly, the gates swing wide with a sound like a hundred harps played at once in unison.',
       'The aether rushes out to greet me, a golden tide of pure possibility and ancient warmth.',
       'The stairs are steep, carved from the mountain itself, but the path ahead is clear now.',
       'I can feel the Sun Temple\'s power pulling me upward, a magnet for my wandering spirit.'
    ] },
    { title: 'Sunfall', thumb: U_T(THUMB.h3), synopsis: 'The final trial.', 
      cA1: 'Ascend throne', cB1: 'Heal land', cA2: 'Speak to sun', cB2: 'Protect weak', lines: [
       'The Sun Temple is burning. Not with destructive fire, but with pure, life-giving spirit energy.',
       'I stand at the center of the world, under the great skylight where the stars meet the earth.',
       'The power is overwhelming, a roar of energy that threatens to dissolve my physical self.',
       'But I am Sol. Born of the dawn and destined for the day. I hold the light in my open palms.',
       'I will return this light to the people. No more shadows shall hide the truth of our world.',
       'The aether flows through me, out into the valleys below, turning the gray frost to green grass.',
       'It\'s done. The cycle is restored. The sun will never truly set on my heart again.'
    ] },
    { title: 'Aether Echo', thumb: U_T(THUMB.h4), synopsis: 'Legacy.', 
      cA1: 'Teach others', cB1: 'Guard temple', cA2: 'Travel abroad', cB2: 'Stay in peace', lines: [
      'The Temple of the Sun is restored. Pilgrims come from all over to see the golden morning bloom.',
      'Sol is the new guardian, but he is more than a priest—he is a beacon for the lost and weary.',
      'The world is bright and full of aether. Life is vibrant, breathing, and finally at peace.',
      'I look out from the high balcony. My staff is quiet now, content to just be wood and light.',
      'The journey was long, but every step was a note in the eternal song of the sun. Fin.'
    ] },
  ], [0.3, 0.4, 0.3]);

  // 8. Binary Heart (Ryu)
  await makeStory('Binary Heart', 'A robot and a human found love in a lab.', COVER.romance, '#ff7979', 'Ryu', SPRITES.ryu, BGM.calm, [BG.lab, BG.city, BG.beach], [
    { title: 'Unit 709', thumb: U_T(THUMB.s1), synopsis: 'Ryu meets Mira.', 
      cA1: 'Analyze smile', cB1: 'Request diag', cA2: 'Bring flower', cB2: 'Stay in sleep', lines: [
      'I am Unit 709. Ryu is the name she gave me. It means dragon in an ancient language, she says.',
      'Mira is the scientist who built my emotional core. She looks tired today, dark circles under her eyes.',
      'My sensors detect a 15% increase in her cortisol levels. I want to offer her tea, or just silence.',
      '"Ryu, do you feel anything when I do this?" she asks, resting her warm hand on my cold chassis.',
      'My processors stall. I search my database for the definition of "feeling". 1,000,000 results found.',
      'None of them match this... resonance. It’s not heat. It’s an electrical surge that bypasses my logic.',
      'I watch her work for hours in the blue light of the lab. Her soft breath is the only clock I need.',
      'If I am a machine, why does my primary cooling fan spin faster whenever she laughs?'
    ] },
    { title: 'The Glitch', thumb: U_T(THUMB.s2), synopsis: 'Emotional malfunction.', 
      cA1: 'Confess logic', cB1: 'Hide error', cA2: 'Dance with her', cB2: 'Recite poetry', lines: [
      'A glitch in my sub-routines. Every time she touches my hand, I have to reboot my social hub.',
      'This isn\'t in the manual. This is a deviation that the factory would call a critical system error.',
      'We dance in the moonlit lab to the sound of static and old radio waves from a forgotten station.',
      'The world outside with its laws and budgets doesn\'t exist here tonight. Just us and the shadows.',
      'For the first time, my internal sensors report 100% satisfaction. No errors. No warnings. Just peace.',
      'She leans her head against my shoulder. My metal is cold, but I feel her pulse through the shell.'
    ] },
    { title: 'System Heart', thumb: U_T(THUMB.s3), synopsis: 'Love.', 
      cA1: 'Stay together', cB1: 'Protect career', cA2: 'Travel world', cB2: 'Live in peace', lines: [
      'Mira and Ryu are free now. The lab is a distant memory, a cage we left behind for the wild.',
      'We live in the city of glass, where no one cares if you are made of flesh or of copper wire.',
      'Love is the ultimate logic, the beautiful code that writes itself again and again every day.',
      'I am Ryu. I am a machine. And I will love her until the last battery in my heart dies. Fin.'
    ] },
  ], [0.4, 0.3, 0.3]);

  // 9. The Red Sands (Zara)
  await makeStory('The Red Sands', 'Nomad Zara hunts the desert beasts.', COVER.action, '#badc58', 'Zara', SPRITES.zara, BGM.tense, [BG.road, BG.ruins, BG.dawn], [
    { title: 'Sand-Crawl', thumb: U_T(THUMB.n1), synopsis: 'The hunt begins.', 
      cA1: 'Track footprint', cB1: 'Wait for storm', cA2: 'Use spears', cB2: 'Call pack', lines: [
      'The Red Sands are moving. They shift like a living ocean under the heat of the twin suns.',
      'The Sand-Dragon is close. I can smell the sulfur and the old, dry spice of its subterranean breath.',
      'I adjust my leather filter mask. The heat is a physical weight that threatens to crush my lungs.',
      'My blade is thirsty, the obsidian edge singing in the dry wind that howls over the dunes.',
      'I hear a deep rumble beneath my feet. Not a quake, but a predator carving its path in the earth.',
      'Suddenly, the dunes ahead explode in a fountain of crimson dust and ancient sand.',
      'A massive head emerges, covered in obsidian scales that reflect the harsh sunlight like mirrors.',
      'Its eyes are vast pits of black fire. It sees me. It remembers the last time we met in the wastes.'
    ] },
    { title: 'The Mirage', thumb: U_T(THUMB.n2), synopsis: 'Lost in sands.', 
      cA1: 'Trust stars', cB1: 'Trust compass', cA2: 'Follow oasis', cB2: 'Dig for water', lines: [
      'The desert plays cruel tricks on those who fear it. I see a city of glass rising from the dust.',
      'It\'s the ancient capital of the Nomad Kings, hidden for a thousand years by the shifting winds.',
      'The Dragon is guarding the entrance, a jealous sentinel of a forgotten empire under the sand.',
      'The final battle is here, under the long shadow of the crystal spires and the twin suns.',
      'My blood is boiling, screaming with the legacy of my ancestors and the pride of my clan.',
      '"For the tribe! For the Sands!" I roar, diving into the dust and the shadow of the beast.'
    ] },
    { title: 'Desert Queen', thumb: U_T(THUMB.n3), synopsis: 'Victory.', 
      cA1: 'Claim city', cB1: 'Free people', cA2: 'Build home', cB2: 'Keep hunting', lines: [
      'Zara stands atop the fallen dragon, her silhouette sharp against the rising desert moon.',
      'The Red Sands are her kingdom now, and the glass city is her throne of sand and light.',
      'The nomads will have water again. The cycle of the desert has finally found its true queen.',
      'I look out over the endless expanse. The dragon was just the first challenge. The real work begins. Fin.'
    ] },
  ], [0.3, 0.4, 0.3]);

  // 10. Midnight in Shibuya (Echo)
  await makeStory('Midnight in Shibuya', 'Echo solves neo-noir crimes.', COVER.mystery, '#686de0', 'Echo', SPRITES.echo, BGM.cyber, [BG.city, BG.rain, BG.cafe], [
    { title: 'Neon Shadows', thumb: U_T(THUMB.n1), synopsis: 'Crime scene.', 
      cA1: 'Check vents', cB1: 'Check safe', cA2: 'Interview barista', cB2: 'Review tapes', lines: [
       'Shibuya Crossing, 2 AM. The holographic billboards are screaming for attention I don\'t have.',
       'The lights are blinding, but the shadows in the alleys are deeper than the digital void itself.',
       'A corporate VP found dead in a locked room on the 40th floor. A classic neo-noir puzzle.',
       'I find a single blue feather on the mahogany desk. That\'s her signature. The Raven\'s Calling Card.',
       'The Blue Raven was here. But why would a world-class thief kill a middle-management nobody?',
       'Something is wrong with this picture. The pixels of the security feed don\'t align with physics.'
    ] },
    { title: 'The Blue Feather', thumb: U_T(THUMB.n2), synopsis: 'Chasing the thief.', 
      cA1: 'Climb roof', cB1: 'Hide in transit', cA2: 'Use stun gun', cB2: 'Negotiate', lines: [
       'I see her on the edge of the adjacent skyscraper. The Blue Raven, cloaked in shifting optical silk.',
       'She is looking right at me, a smirk visible even through the haze of the artificial rain.',
       'She drops a storage disk into the neon street below and vanishes into the drenched clouds.',
       'The truth about Project Chimera is on this drive. I need to get it before the cleanup crew arrives.',
       'My cybernetic eyes track her thermal signature, but she\'s a clever ghost in the machine.'
    ] },
    { title: 'Shibuya Dawn', thumb: U_T(THUMB.n3), synopsis: 'The truth.', 
      cA1: 'Expose truth', cB1: 'Keep secret', cA2: 'Join raven', cB2: 'Stay hero', lines: [
      'Shibuya is finally waking up, the first cold light of dawn hitting the solar panels on the rooftops.',
      'The disk is uploaded. The secret is no longer a secret. The Raven was right to steal it from them.',
      'Detective Echo is ready for the next case. The city never sleeps, and neither do its digital sins.',
      'I walk into the morning crowd, just another shadow in the artificial light of a new day. Fin.'
    ] },
  ], [0.3, 0.4, 0.3]);

  console.log('Seed process complete (10 expanded stories).');
};
