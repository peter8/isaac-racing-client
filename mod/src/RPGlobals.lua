local RPGlobals  = {}

--
-- Global variables
--

RPGlobals.version = "v0.6.14"

-- These are per run
-- (defaults are set below in the "RPGlobals:InitRun()" function)
RPGlobals.run = {}

-- This is the table that gets updated from the "save.dat" file
RPGlobals.race = {
  status          = "none",      -- Can be "none", "open", "starting", "in progress"
  myStatus        = "not ready", -- Can be either "not ready", "ready", or "racing"
  rType           = "unranked",  -- Can be "unranked", "ranked" (this is not currently used)
  solo            = false,       -- Can be either false or true
  rFormat         = "unseeded",  -- Can be "unseeded", "seeded", "diveristy", "custom"
  character       = 3,           -- 3 is Judas; can be 0 to 15 (the "PlayerType" Lua enumeration)
  goal            = "Blue Baby", -- Can be "Blue Baby", "The Lamb", "Mega Satan"
  seed            = "-",         -- Corresponds to the seed that is the race goal
  startingItems   = {},          -- The starting items for this race
  countdown       = -1,          -- This corresponds to the graphic to draw on the screen
  placeMid        = 0,           -- This is either the number of people ready, or the non-fnished place
  place           = 1,           -- This is the final place
  numEntrants     = 1,           -- The number of people in the race
  order7          = {0},         -- The order for a Racing+ 7 character speedrun
  order9          = {0},         -- The order for a Racing+ 9 character speedrun
  order14         = {0},         -- The order for a Racing+ 14 character speedrun
}

-- These are things that pertain to the race but are not read from the "save.dat" file
RPGlobals.raceVars = {
  loadOnNextFrame    = false,
  difficulty         = 0,
  challenge          = 0,
  resetEnabled       = true,
  started            = false,
  startedTime        = 0,
  finished           = false,
  finishedTime       = 0,
  showPlaceGraphic   = false,
  fireworks          = 0,
  removedMoreOptions = false,
  placedJailCard     = false,
  victoryLaps        = 0,
}

RPGlobals.RNGCounter = {
  BookOfSin     = 0,
  Teleport      = 0, -- Broken Remote also uses this
  Undefined     = 0,
  Telepills     = 0,
}

--
-- Extra enumerations
--

-- Collectibles
-- (unused normal item IDs: 43, 59, 61, 235, 263)
CollectibleType.COLLECTIBLE_BOOK_OF_SIN_SEEDED      = Isaac.GetItemIdByName("The Book of Sin") -- Replacing 97
CollectibleType.COLLECTIBLE_BETRAYAL_NOANIM         = Isaac.GetItemIdByName("Betrayal") -- Replacing 391
CollectibleType.COLLECTIBLE_SMELTER_LOGGER          = Isaac.GetItemIdByName("Smelter") -- Replacing 479
CollectibleType.COLLECTIBLE_DEBUG                   = Isaac.GetItemIdByName("Debug")
CollectibleType.COLLECTIBLE_SCHOOLBAG               = Isaac.GetItemIdByName("Schoolbag")
CollectibleType.COLLECTIBLE_SOUL_JAR                = Isaac.GetItemIdByName("Soul Jar")
CollectibleType.COLLECTIBLE_TROPHY                  = Isaac.GetItemIdByName("Trophy")
CollectibleType.COLLECTIBLE_VICTORY_LAP             = Isaac.GetItemIdByName("Victory Lap")
CollectibleType.COLLECTIBLE_FINISHED                = Isaac.GetItemIdByName("Finished")
CollectibleType.COLLECTIBLE_OFF_LIMITS              = Isaac.GetItemIdByName("Off Limits")
CollectibleType.COLLECTIBLE_13_LUCK                 = Isaac.GetItemIdByName("13 Luck")
CollectibleType.COLLECTIBLE_CHECKPOINT              = Isaac.GetItemIdByName("Checkpoint")
CollectibleType.COLLECTIBLE_DIVERSITY_PLACEHOLDER_1 = Isaac.GetItemIdByName("Diversity Placeholder #1")
CollectibleType.COLLECTIBLE_DIVERSITY_PLACEHOLDER_2 = Isaac.GetItemIdByName("Diversity Placeholder #2")
CollectibleType.COLLECTIBLE_DIVERSITY_PLACEHOLDER_3 = Isaac.GetItemIdByName("Diversity Placeholder #3")
CollectibleType.NUM_COLLECTIBLES                    = Isaac.GetItemIdByName("Diversity Placeholder #3") + 1

-- Cards
Card.CARD_HUGE_GROWTH = 52
Card.CARD_ANCIENT_RECALL = 53
Card.CARD_ERA_WALK = 54
Card.NUM_CARDS = 55

-- Pills
PillEffect.PILLEFFECT_GULP_LOGGER = Isaac.GetPillEffectByName("Gulp!") -- 47
PillEffect.NUM_PILL_EFFECTS       = Isaac.GetPillEffectByName("Gulp!") + 1

-- Pickups
PickupVariant.PICKUP_MIMIC = 54

-- Sounds
SoundEffect.SOUND_SPEEDRUN_FINISH = Isaac.GetSoundIdByName("Speedrun Finish")
SoundEffect.NUM_SOUND_EFFECTS     = Isaac.GetSoundIdByName("Speedrun Finish") + 1

-- Spaded by ilise rose (@yatboim)
RPGlobals.RoomTransition = {
  TRANSITION_NONE              = 0,
  TRANSITION_DEFAULT           = 1,
  TRANSITION_STAGE             = 2,
  TRANSITION_TELEPORT          = 3,
  TRANSITION_ANKH              = 5,
  TRANSITION_DEAD_CAT          = 6,
  TRANSITION_1UP               = 7,
  TRANSITION_GUPPYS_COLLAR     = 8,
  TRANSITION_JUDAS_SHADOW      = 9,
  TRANSITION_LAZARUS_RAGS      = 10,
  TRANSITION_GLOWING_HOURGLASS = 12,
  TRANSITION_D7                = 13,
  TRANSITION_MISSING_POSTER    = 14,
}

-- Spaded by me
RPGlobals.FadeoutTarget = {
  -- -1 and lower result in a black screen
  FADEOUT_FILE_SELECT     = 0,
  FADEOUT_MAIN_MENU       = 1,
  FADEOUT_TITLE_SCREEN    = 2,
  FADEOUT_RESTART_RUN     = 3,
  FADEOUT_RESTART_RUN_LAP = 4,
  -- 5 and higher result in a black screen
}

--
-- Misc. subroutines
--

function RPGlobals:InitRun()
  -- Tracking per run
  RPGlobals.run.roomsEntered     = 0
  RPGlobals.run.touchedBookOfSin = false
  RPGlobals.run.handsDelay       = 0

  -- Tracking per floor
  RPGlobals.run.currentFloor        = 0
  -- (start at 0 so that we can trigger the PostNewRoom callback after the PostNewLevel callback)
  RPGlobals.run.levelDamaged        = false
  RPGlobals.run.replacedPedestals   = {}
  RPGlobals.run.replacedTrapdoors   = {}
  RPGlobals.run.replacedCrawlspaces = {}
  RPGlobals.run.replacedHeavenDoors = {}
  RPGlobals.run.finishPedestals     = {}
  RPGlobals.run.victoryLapPedestals = {}

  -- Tracking per room
  RPGlobals.run.currentRoomClearState = true
  RPGlobals.run.currentGlobins        = {}
  RPGlobals.run.currentKnights        = {}
  RPGlobals.run.currentLilHaunts      = {}
  RPGlobals.run.naturalTeleport       = false
  RPGlobals.run.megaSatanDead         = false

  -- Temporary tracking
  RPGlobals.run.showingStage         = false
  RPGlobals.run.restartFrame         = 0
  RPGlobals.run.itemReplacementDelay = 0
  RPGlobals.run.usedTelepills        = false
  RPGlobals.run.giveExtraCharge      = false
  RPGlobals.run.consoleWindowOpen    = false
  RPGlobals.run.droppedButterItem    = 0
  RPGlobals.run.fastResetFrame       = 0
  RPGlobals.run.teleportSubverted     = false
  RPGlobals.run.teleportSubvertScale  = Vector(1, 1)
  RPGlobals.run.dualityCheckFrame     = 0
  RPGlobals.run.seededMOCheckFrame    = 0
  RPGlobals.run.trapdoorCollision     = nil
  RPGlobals.run.changeFartColor       = false

  -- Boss hearts tracking
  RPGlobals.run.bossHearts = {
    spawn       = false,
    extra       = false,
    extraIsSoul = false,
    position    = {},
    velocity    = {},
  }

  -- Eden's Soul tracking
  RPGlobals.run.edensSoulSet     = false
  RPGlobals.run.edensSoulCharges = 0

  -- Trapdoor tracking
  RPGlobals.run.trapdoor = {
    state     = 0,
    upwards   = false,
    floor     = 0,
    frame     = 0,
    scale     = Vector(0, 0),
  }

  -- Crawlspace tracking
  RPGlobals.run.crawlspace = {
    prevRoom    = 0,
    direction   = -1, -- Used to fix nested room softlocks
    blackMarket = false,
  }

  -- Keeper + Greed's Gullet tracking
  RPGlobals.run.keeper = {
    baseHearts   = 4, -- Either 4 (for base), 2, 0, -2, -4, -6, etc.
    healthItems  = {},
    coins        = 50,
    usedStrength = false,
  }

  -- Schoolbag tracking
  RPGlobals.run.schoolbag = {
    item            = 0,
    charges         = 0,
    pressed         = false, -- Used for keeping track of whether the "Switch" button is held down or not
    lastCharge      = 0,     -- Used to keep track of the charges when we pick up a second active item
    lastRoomItem    = 0,     -- Used to prevent bugs with GLowing Hour Glass
    lastRoomCharges = 0,     -- Used to prevent bugs with GLowing Hour Glass
    nextRoomCharge  = false, -- Used to prevent bugs with GLowing Hour Glass
    bossRushActive  = false, -- Used for giving a charge when the Boss Rush starts
  }

  -- Soul Jar tracking
  RPGlobals.run.soulJarSouls = 0
end

function RPGlobals:IncrementRNG(seed)
  -- The game expects seeds in the range of 0 to 4294967295
  local rng = RNG()
  rng:SetSeed(seed, 35)
  -- This is the ShiftIdx that blcd recommended after having reviewing the game's internal functions
  rng:Next()
  local newSeed = rng:GetSeed()
  return newSeed
end

function RPGlobals:GridToPos(x, y)
  local game = Game()
  local room = game:GetRoom()
  x = x + 1
  y = y + 1
  return room:GetGridPosition(y * room:GetGridWidth() + x)
end

-- Get a Config::Item from an collectible ID
-- from ilise rose (@yatboim)
-- (this will crash the game if fed an item ID of 0)
function RPGlobals:GetConfigItem(id)
    local player = Isaac.GetPlayer(0)
    player:GetEffects():AddCollectibleEffect(id, true)
    local effect = player:GetEffects():GetCollectibleEffect(id)
    player:GetEffects():RemoveCollectibleEffect(id)
    return effect.Item
end

-- From: http://lua-users.org/wiki/SimpleRound
function RPGlobals:Round(num, numDecimalPlaces)
  local mult = 10 ^ (numDecimalPlaces or 0)
  return math.floor(num * mult + 0.5) / mult
end

function RPGlobals:TableEqual(table1, table2)
  -- First, find out if they are nil
  if table1 == nil and table2 == nil then
    return true
  end
  if table1 == nil then
    table1 = {}
  end
  if table2 == nil then
    table2 = {}
  end

  -- First, compare their size
  if #table1 ~= #table2 then
    return false
  end

  -- Compare each element
  for i = 1, #table1 do
    if table1[i] ~= table2[i] then
      return false
    end
  end
  return true
end

-- Find out how many charges this item has
function RPGlobals:GetItemMaxCharges(itemID)
  -- Local variables
  local itemConfig = Isaac.GetItemConfig()

  if itemID == 0 then
    return 0
  else
    return itemConfig:GetCollectible(itemID).MaxCharges
  end
end

function RPGlobals:InsideSquare(pos1, pos2, squareSize)
  if pos1.X >= pos2.X - squareSize and
     pos1.X <= pos2.X + squareSize and
     pos1.Y >= pos2.Y - squareSize and
     pos1.Y <= pos2.Y + squareSize then

    return true
  else
    return false
  end
end

-- This is used for the Victory Lap feature that spawns multiple bosses
RPGlobals.bossArray = {
  {19, 0, 0}, -- Larry Jr.
  {19, 0, 1}, -- Larry Jr. (green)
  {19, 0, 2}, -- Larry Jr. (blue)
  {19, 1, 0}, -- The Hollow
  {19, 1, 1}, -- The Hollow (green)
  {19, 1, 2}, -- The Hollow (grey)
  {19, 1, 3}, -- The Hollow (yellow)
  {20, 0, 0}, -- Monstro
  {20, 0, 1}, -- Monstro (double red)
  {20, 0, 2}, -- Monstro (grey)
  {28, 0, 0}, -- Chub
  {28, 0, 1}, -- Chub (green)
  {28, 0, 2}, -- Chub (yellow)
  {28, 1, 0}, -- C.H.A.D.
  {28, 2, 0}, -- Carrion Queen
  {28, 2, 1}, -- Carrion Queen (pink)
  {36, 0, 0}, -- Gurdy
  {36, 0, 1}, -- Gurdy (dark)
  {43, 0, 0}, -- Monstro II
  {43, 0, 1}, -- Monstro II (red)
  {43, 1, 0}, -- Gish
  {62, 0, 0}, -- Pin
  {62, 1, 0}, -- Scolex
  {62, 1, 1}, -- Scolex (black)
  {62, 2, 0}, -- Frail
  {62, 2, 1}, -- Frail (black)
  {63, 0, 0}, -- Famine
  {63, 0, 1}, -- Famine (blue)
  {63, 0, 1}, -- Famine (blue)
  {64, 0, 0}, -- Pestilence
  {64, 0, 1}, -- Pestilence (white)
  {65, 0, 0}, -- War
  {65, 0, 1}, -- War (dark)
  {65, 1, 0}, -- Conquest
  {66, 0, 0}, -- Death
  {66, 0, 1}, -- Death (black)
  {67, 0, 0}, -- The Duke of Flies
  {67, 0, 1}, -- The Duke of Flies (green)
  {67, 0, 2}, -- The Duke of Flies (peach)
  {67, 1, 0}, -- The Husk
  {67, 1, 1}, -- The Husk (black)
  {67, 1, 2}, -- The Husk (grey)
  {68, 0, 0}, -- Peep
  {68, 0, 1}, -- Peep (yellow)
  {68, 0, 2}, -- Peep (green)
  {68, 1, 0}, -- The Bloat
  {68, 1, 1}, -- The Bloat (green)
  {69, 0, 0}, -- Loki
  {69, 1, 0}, -- Lokii
  {71, 0, 0}, -- Fistula
  {71, 0, 1}, -- Fistula (black)
  {71, 1, 0}, -- Teratoma
  {74, 0, 0}, -- Blastocyst
  {79, 0, 0}, -- Gemini
  {79, 0, 1}, -- Gemini (green, disattached)
  {79, 0, 2}, -- Gemini (blue)
  {79, 1, 0}, -- Steven
  {79, 2, 0}, -- The Blighted Ovum
  {81, 0, 0}, -- The Fallen
  --{81, 1, 0}, -- Krampus
  -- (don't include Krampus since is he too common and he spawns an item)
  {82, 0, 0}, -- The Headless Horseman
  {97, 0, 0}, -- Mask of Infamy
  {99, 0, 0}, -- Gurdy Jr.
  {99, 0, 1}, -- Gurdy Jr. (double blue)
  {99, 0, 2}, -- Gurdy Jr. (orange)
  {100, 0, 0}, -- Widow
  {100, 0, 1}, -- Widow (black)
  {100, 0, 2}, -- Widow (pink)
  {100, 1, 0}, -- The Wretched
  {101, 0, 0}, -- Daddy Long Legs
  {101, 1, 0}, -- Triachnid
  {237, 1, 0}, -- Gurglings
  {237, 1, 1}, -- Gurglings (double yellow)
  {237, 1, 2}, -- Gurglings (black)
  {237, 2, 0}, -- Turdling
  {260, 0, 0}, -- The Haunt
  {260, 0, 1}, -- The Haunt (black)
  {260, 0, 2}, -- The Haunt (pink)
  {261, 0, 0}, -- Dingle
  {261, 0, 1}, -- Dingle (red)
  {261, 0, 2}, -- Dingle (black)
  {261, 1, 0}, -- Dangle
  {262, 0, 0}, -- Mega Maw
  {262, 0, 1}, -- Mega Maw (red)
  {262, 0, 2}, -- Mega Maw (black)
  {263, 0, 0}, -- The Gate
  {263, 0, 1}, -- The Gate (red)
  {263, 0, 2}, -- The Gate (black)
  {264, 0, 0}, -- Mega Fatty
  {264, 0, 1}, -- Mega Fatty (red)
  {264, 0, 2}, -- Mega Fatty (yellow)
  {265, 0, 0}, -- The Cage
  {265, 0, 1}, -- The Cage (green)
  {265, 0, 2}, -- The Cage (double pink)
  {266, 0, 0}, -- Mama Gurdy
  {267, 0, 0}, -- Dark One
  {268, 0, 0}, -- The Adversary
  {269, 0, 0}, -- Polycephalus
  {269, 0, 1}, -- Polycephalus (red)
  {269, 0, 2}, -- Polycephalus (double pink)
  {270, 0, 0}, -- Mr. Fred
  {271, 0, 0}, -- Uriel
  {271, 1, 0}, -- Uriel (fallen)
  {272, 0, 0}, -- Gabriel
  {272, 1, 0}, -- Gabriel (fallen)
  {401, 0, 0}, -- The Stain
  {401, 0, 1}, -- The Stain (dark)
  {402, 0, 0}, -- Brownie
  {402, 0, 1}, -- Brownie (dark)
  {403, 0, 0}, -- The Forsaken
  {403, 0, 1}, -- The Forsaken (black)
  {404, 0, 0}, -- Little Horn
  {404, 0, 1}, -- Little Horn (grey)
  {404, 0, 2}, -- Little Horn (black)
  {405, 0, 0}, -- Rag Man
  {405, 0, 1}, -- Rag Man (orange)
  {405, 0, 2}, -- Rag Man (black)
  {409, 0, 0}, -- Rag Mega
  {410, 0, 0}, -- Sisters Vis
  {411, 0, 0}, -- Big Horn
}

return RPGlobals
