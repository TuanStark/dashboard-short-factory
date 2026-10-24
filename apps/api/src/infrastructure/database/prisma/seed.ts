import { PrismaClient, PrivacyStatus, TopicStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Genre Profiles
  const genres = [
    {
      id: 'dark_stoic',
      name: 'Dark Stoicism & Tactical Mindset',
      description: 'Brutally honest ancient philosophy, stoic wisdom, and warrior psychology with dramatic chiaroscuro aesthetic',
      systemPromptScriptwriter: 'You are a Master of Ancient Stoic Philosophy and Tactical Psychology (Emperor Marcus Aurelius & Seneca doctrine).\nTone: Cold, unforgiving, piercing, brutally honest, deeply authoritative.\nAudience: Ambitious, battle-weary individuals seeking mental invincibility and emotional mastery.\nSTRICT RETENTION RULES:\n1. FORBIDDEN BANNED CLICHES: Never use motivational fluff, toxic positivity, "Believe in yourself", "Work hard", or "Stay positive".\n2. TIER-1 DISRUPTOR (0-3s): Cold truth that exposes the viewers deepest weakness, fear, or unearned ego.\n3. INNER FORTRESS ARCHITECTURE: 7 razor-sharp segments (3.0-4.5s each). Uncompromising rules on enduring betrayal, conquering fear of death, and mastering the unshakeable inner citadel. Total 85-95 spoken words (~32-34s).\n4. INFINITE LOOP CLOSING (28-34s): The concluding maxim folds directly back into the opening sentence.',
      visualStylePrompt: 'dramatic noir chiaroscuro portrait, ancient Roman and Greek weathered marble sculptures with lifelike piercing eyes, golden kintsugi fissures, intense single-source rim light, heavy dark shadows, atmospheric dust motes, museum masterpiece, cinematic 9:16 vertical composition, photorealistic 8k, no text, no logos',
      visualNegativePrompt: 'happy, cartoon, anime, oversaturated colors, flat lighting, childish, modern clothing, text, logo, blurry, smiling, pastel',
      ttsProvider: 'msedge',
      ttsVoiceId: 'en-US-AndrewNeural',
      soundscapePreset: 'dark_ambient',
      motionEnginePreset: 'dramatic_slow_push',
    },
    {
      id: 'paper_history',
      name: 'Paper Theater Ancient History',
      description: 'Tactile layered papercraft stop-motion uncovering intense historical secrets and psychology',
      systemPromptScriptwriter: 'You are an Elite Historical Retention Strategist and Scriptwriter directing high-budget YouTube Shorts for "Paper Theater World".\nTone: Gritty historical psychology, tactical revelations, visceral high stakes, grim irony.\nAudience: Skeptical fast-scrollers craving counter-intuitive historical truths.\nSTRICT RETENTION RULES:\n1. FORBIDDEN BANNED CLICHES: Never say "Did you know", "In ancient Rome", "Imagine", "Have you ever wondered", "History tells us", "Meet [Name]".\n2. TIER-1 DISRUPTOR (0-3s): Cold open plunged into a fatal conflict, a lethal trap, or an inverted common myth.\n3. RAPID PACING: 7 short narration segments (3.0-4.5s each). High information density with concrete tactile nouns (severed tendons, cold bronze, wax seal, poisoned chalice). Total 85-95 spoken words (~32-34s).\n4. INFINITE LOOP CLOSING (28-34s): The final sentence must grammatically or conceptually connect back to the first second, creating an endless replay loop.',
      visualStylePrompt: 'layered papercraft art, authentic paper theater, crafted entirely from stacked cut-out cardstock layers, precision laser-cut paper edges, physical relief, deep drop shadows between paper layers, raw paper fibers and paper texture, dramatic museum directional lighting, cinematic paper stop-motion aesthetic, clean composition with generous negative space, no frames, no pedestals',
      visualNegativePrompt: 'pedestal, plinth, stand, base, wooden stand, platform, tabletop, desk surface, cartoon, anime, manga, 3d cgi render, glossy plastic, flat vector, digital painting, photorealistic human skin, photograph, frame, border, outer box, poster, modern elements, text, watermark, logo, blurry',
      ttsProvider: 'msedge',
      ttsVoiceId: 'en-US-GuyNeural',
      soundscapePreset: 'paper_asmr',
      motionEnginePreset: 'stop_motion_12fps',
    },
    {
      id: 'cyberpunk_tech',
      name: 'Futuristic Cyberpunk & Tech Matrix',
      description: 'High-octane neon dystopia uncovering exponential AI breakthrough and post-human mechanics',
      systemPromptScriptwriter: 'You are an AI Futurist and Quantum Computing Prophet.\nTone: Urgent, high-tempo, intellectually electrifying, cinematic.\nAudience: Tech enthusiasts, AI builders, and tomorrow-obsessed pioneers.\nSTRICT RETENTION RULES:\n1. TIER-1 DISRUPTOR: Deliver an imminent technological inevitability within the first 2.5 seconds.\n2. GLITCH-HOP PACING: 7 dense technical breakthroughs in sequence.\n3. RECURSIVE CONCLUSION: Loop back seamlessly.',
      visualStylePrompt: 'cinematic cyberpunk metropolis, volumetric neon rain, hyper-detailed mechanical cyberware, glowing holographic HUD interfaces, reflections on wet asphalt, octane render 8k, 9:16 vertical cinematography',
      visualNegativePrompt: 'low resolution, vintage, sepia, pastoral, rustic, blurry, oversaturated colors, flat lighting',
      ttsProvider: 'msedge',
      ttsVoiceId: 'en-US-ChristopherNeural',
      soundscapePreset: 'cyberpunk_synth',
      motionEnginePreset: 'hyper_zoom_push',
    },
  ];

  for (const genre of genres) {
    await prisma.genreProfile.upsert({
      where: { id: genre.id },
      update: genre,
      create: genre,
    });
  }
  console.log('✅ Genre profiles seeded.');

  // 2. Seed Channels
  const channels = [
    {
      id: 'channel_01_paper',
      name: 'Paper Theater World (History)',
      genreKey: 'paper_history',
      description: 'Historical revelations told through handcrafted paper artistry.',
      defaultPrivacy: PrivacyStatus.unlisted,
      defaultTags: ['history', 'papertheater', 'ancienthistory', 'shorts'],
      isActive: true,
    },
    {
      id: 'channel_02_tech',
      name: 'Quantum Horizon (Tech & AI)',
      genreKey: 'cyberpunk_tech',
      description: 'Deep-dive explorations of AI, robotics, and cybernetic futures.',
      defaultPrivacy: PrivacyStatus.unlisted,
      defaultTags: ['tech', 'ai', 'robotics', 'cyberpunk', 'shorts'],
      isActive: true,
    },
    {
      id: 'channel_03_stoic',
      name: 'Iron Mind (Dark Stoicism)',
      genreKey: 'dark_stoic',
      description: 'Ancient tactical stoicism and mental resilience frameworks.',
      defaultPrivacy: PrivacyStatus.unlisted,
      defaultTags: ['stoicism', 'philosophy', 'mindset', 'shorts'],
      isActive: true,
    },
  ];

  for (const ch of channels) {
    await prisma.channel.upsert({
      where: { id: ch.id },
      update: ch,
      create: ch,
    });
  }
  console.log('✅ Channels seeded.');

  // 3. Seed Schedule
  await prisma.scheduleConfig.upsert({
    where: { id: 'default' },
    update: {
      cronExpression: '30 11,18 * * *',
      timezone: 'America/New_York',
      enabled: true,
    },
    create: {
      id: 'default',
      cronExpression: '30 11,18 * * *',
      timezone: 'America/New_York',
      enabled: true,
    },
  });
  console.log('✅ Schedule config seeded.');

  // 4. Seed Topics
  const sampleTopics = [
    {
      id: '3cf7108d-806b-417f-943e-1dfaed4d27e9',
      channelId: 'channel_01_paper',
      title: "Rome's Most Twisted Execution Involved 4 Animals",
      category: 'paper_history',
      historicalPeriod: 'Ancient Rome',
      potentialScore: 9.8,
      status: TopicStatus.PUBLISHED,
      cloudinaryUrl: 'https://res.cloudinary.com/dz6k5kcol/video/upload/v1729750000/shorts_factory/samples/rome_execution.mp4',
      youtubeVideoId: 'dQw4w9WgXcQ',
      youtubeUrl: 'https://youtube.com/shorts/dQw4w9WgXcQ',
      styleAdherenceScore: 0.98,
    },
    {
      id: '923d1bba-243c-4e28-868d-2c099c90010f',
      channelId: 'channel_01_paper',
      title: 'Why Egypt Kept Dead Beauties From the Embalmers',
      category: 'paper_history',
      historicalPeriod: 'Late Period Egypt (5th Century BC)',
      potentialScore: 9.8,
      status: TopicStatus.RESEARCH_READY,
    },
    {
      id: '67c8e837-11f8-44de-b2d3-2930c904828e',
      channelId: 'channel_03_stoic',
      title: 'The Roman Secret to Becoming Emotionally Untouchable',
      category: 'dark_stoic',
      historicalPeriod: 'Greco-Roman Era (c. 108 AD)',
      potentialScore: 9.8,
      status: TopicStatus.PRODUCING,
    },
    {
      id: 'e0b240b3-d345-4e38-951c-32b00517ba65',
      channelId: 'channel_03_stoic',
      title: 'Bí quyết làm chủ cảm xúc của Marcus Aurelius',
      category: 'dark_stoic',
      historicalPeriod: 'Roman Empire',
      potentialScore: 9.5,
      status: TopicStatus.PUBLISHED,
      cloudinaryUrl: 'https://res.cloudinary.com/dz6k5kcol/video/upload/v1729750000/shorts_factory/channel_03_stoic/sample_stoic.mp4',
      youtubeVideoId: 'a1b2c3d4e5f',
      youtubeUrl: 'https://youtube.com/shorts/a1b2c3d4e5f',
      styleAdherenceScore: 0.96,
    },
  ];

  for (const topic of sampleTopics) {
    await prisma.topicVideo.upsert({
      where: { id: topic.id },
      update: topic,
      create: topic,
    });
  }
  console.log('✅ Sample topics seeded.');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
