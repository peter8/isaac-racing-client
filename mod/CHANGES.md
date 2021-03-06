# Racing+ Mod Changes

## Website

If you want to learn more about Racing+, you can visit [the official website](https://isaacracing.net). If you want to know the changes that are present in the in-game mod, read on.

<br />

## Design Goals

In terms of what to change about the game, the mod has several goals, and attempts to strike a balance between them. However, certain things are prioritized. The goals are listed below in order of importance:

1) to reward skillful play (in the context of speedrunning and racing)
2) to make the game more fun to play
3) to fix bugs and imperfections
4) to keep the game as "vanilla" as possible

<br />

## List of Main Changes

### 1) Character Changes

(Most races are done with Judas. The Eden change is to preserve her active item and the Keeper change is done for the [R+9](http://www.speedrun.com/afterbirthplus/full_game#R%2B_9_char) speedrun category.)

* All characters now start with the D6.
* Certain characters have their starting health changed so that they can consistently take a devil deal:
  * Judas starts with half a red heart and half a soul heart.
  * Blue Baby starts with three and a half soul hearts.
  * Azazel starts with half a red heart and half a soul heart.
* Judas starts with a bomb instead of 3 coins.
* Eden starts with the Schoolbag (from Antibirth). She will start with her random active item inside the bag.
* Keeper starts with Greed's Gullet, Duality, and 50 cents.

### 2) No Curses

All curses are automatically disabled.

### 3) Devil Room & Angel Room Changes

Devil Rooms and Angel Rooms without item pedestals in them have been removed.

### 4) Wrath of the Lamb Style Room Clear

Room clear was incorrectly ported from Wrath of Lamb to Rebirth; doors are supposed to open at the beginning of an enemy's death animation, not at the end. The Racing+ mod fixes this to be the way it was originally intended.

### 5) Room Fixes

Hundreds of rooms with unavoidable damage or bugs have been fixed or deleted.

<br />

## Other Minor Bug Fixes & Quality of Life Changes

* Some items with no effect at all are removed:
  * the Karma trinket (all Donation Machines are removed when mods are enabled)
  * the Amnesia pill (this has no effect with curses disabled)
  * the ??? pill (this has no effect with curses disabled)
* Cutscenes are removed. (However, there is an option in the client to re-enable boss cutscenes for racers with cutscene skip muscle memory.)
* Some useless animations are removed:
  * the fade when entering a new floor
  * the fade when entering or exiting crawlspaces
  * teleporting upwards
  * the use animation for Telepills
  * the use animation for Blank Card when you have a teleport card
* Some things that are unseeded are now seeded:
  * rerolls on items after being touched or purchased
  * Teleport!, Undefined, Cursed Eye, Broken Remote, and Telepills teleports
  * heart drops from multi-segment bosses
  * Krampus items (with Gimpy)
* The restart key now immediately restarts the game. (To perform a fast-restart on floors 2 and beyond, you need to double tap R.)
* Void Portals will automatically be deleted.
* The "drop" button will now immediately drop cards and trinkets. (This won't happen if you have the Schoolbag, Starter Deck, Little Baggy, Deep Pockets, or Polydactyly.)
* Troll Bombs and Mega Troll Bombs now always have a fuse timer of exactly 2 seconds.
* Special items are no longer special.
* Charge bars are no longer obnoxiously big.
* Globins will permanently die upon the 5th regeneration to prevent Epic Fetus softlocks.
* Knights, Selfless Knights, Floating Knights, Bone Knights, Eyes, Bloodshot Eyes, Wizoobs, Red Ghosts, and Lil' Haunts no longer have invulernability frames after spawning.
* Mom's Hands, Mom's Dead Hands, Wizoobs, and Red Ghosts will now have faster attack patterns.
* The Book of Sin and Mystery Sack will now generate actual random pickups.
* Greed's Gullet will now properly work on Keeper.
* Double coins and nickels now heal Keeper for their proper amount.
* Eden's Soul will now always properly start at 0 charges.
* AAA Battery will now synergize with The Battery.
* 9 Volt will now synergize with The Battery.
* The colors of some Purity auras have been changed to make them easier to see. Speed is now green and range is now yellow.
* Betrayal no longer pauses the game and plays an animation before charming enemies.
* The pickup delay on reloaded pedestal items is decreased from 0.67 seconds to 0.33 seconds.
* The disruptive teleport that occurs when entering a room with Gurdy, Mom's Heart, or It Lives! will no longer occur.
* It is now impossible to get a narrow boss room on floors 2 through 7 when having Duality.
* The "Would you like to do a Victory Lap!?" popup will no longer appear after defeating The Lamb.
* All Spike Chests will now spawn as Mimics instead.
* Fixed the unavoidable damage when Mimics happen to spawn on top of you.
* Fixed the unavoidable damage when Spiked Chests or Mimics happen to spawn in specific rooms that only have a narrow path surrounded by walls or pits.
* Mushrooms can no longer spawn outside of floors 3 and 4. (They will spawn as Hosts instead.) This fixes the instantaneous damage when you walk over a skull with Leo / Thunder Thighs.
* Hosts and Mobile Hosts are now immune to fear.
* You no longer have a chance to be sent to the menu after defeating Mega Satan.
* Returning from a crawlspace in a Boss Rush or Devil Deal will no longer send you to the wrong room.
* The recharge sound will no longer play at the beginning of a run.
* The door opening sound will no longer play in crawlspaces.
* The Broken Modem sprite is replaced with a better version from freeze, the original creator.
* The bug where the bottom left hand corner of the title screen would not properly show is fixed.
* Spawning a co-op baby will automatically kill the baby, return the heart to you, and delete all item pedestals in the room. (This is to prevent various co-op baby-related exploits.)
* The Polaroid or The Negative will be automatically removed depending on your run goal. By default, it will remove The Negative.
* The trapdoor or the beam of light on Womb 2 will be automatically removed depending on your run goal. By default, it will remove the trapdoor.

If you want, you can change the run goal manually in your "save1.dat" file, located in the Racing+ mod folder. By default, this is located at:
```
C:\Users\[YourUsername]\Documents\My Games\Binding of Isaac Afterbirth+ Mods\racing+_dev\save1.dat
```
(The "save1.dat" file corresponds to save slot #1. If you play on save slot #2 or #3, edit "save2.dat" or "save3.dat" accordingly.)

<br />

## Additional Changes for Custom Rulesets

Historically, most speedruns and races have been unseeded with the goal of killing Blue Baby. However, there are other rulesets used:

### Seeded

* All characters start with The Compass in addition to their other items.
* The Cain's Eye trinket is removed from the game.
* All characters start with the Schoolbag (from Antibirth).

### Diversity

* Each racer starts with the same five random items. (This is in addition to the character's original passive items and resources.)
* For additional information, see [the documentation for diversity races](https://github.com/Zamiell/isaac-racing-client/blob/master/mod/README-DIVERSITY.md).

### Dark Room

* Some useless animations during the Satan fight have been removed to make the fight smoother.
* 4 gold chests will now spawn at the beginning of the Dark Room (instead of red chests).
* Teleporting to the Dark Room via a Sacrifice Room on floors 1 through 8 will send you to the next floor instead.

### Mega Satan

* The door to Mega Satan will automatically open upon reaching The Chest or the Dark Room.
* Some useless animations during the Mega Satan fight have been removed to make the fight smoother.
* Teleporting to the Dark Room via a Sacrifice Room on floors 1 through 8 will send you to the next floor instead.

### Custom Character Speedruns

* By pressing "Tab" on the challenges screen, you can access custom challenges. The Racing+ mod has several custom challenge for various categories, in which you must beat the game multiple times in a row on various characters.
* These custom challenges will automatically take you to the next character so that you never have to return to the menu. They will also show a timer on the screen and your current character progress.
* Before starting a speedrun, you must define a character order by using the "Change Char Order" custom challenge.
* You can restart with the current character by tapping R. You can go back to the first character by holding R. (On floors 2 and beyond, you have to double-tap R to restart with the current character.)

#### R+9 Season 1

* You must defeat Blue Baby on the following 9 characters:
  * Cain, Judas, Blue Baby, Eve, Samson, Azazel, Lazarus, The Lost, and Keeper

#### R+14 Season 1

* You must defeat Blue Baby on all 14 characters.
* Some characters have additional changes:
  * Isaac starts with The Battery.
  * Maggy starts with the Soul Jar, a new passive item with the following effects:
    * You no longer gain health from soul/black hearts.
    * You gain a red heart container after picking up 4 soul/black hearts.
    * You always have a 100% devil deal chance if no damage is taken.
  * Lilith starts with the Schoolbag. She will start with Box of Friends inside the bag.
  * Apollyon now starts with the Schoolbag. He will start with Void inside the bag.

#### R+7 Season 2

* You must defeat The Lamb on the following 7 characters:
  * Isaac, Cain, Judas, Azazel, Eden, Apollyon, and Samael
* After defeating Mom, The Polaroid will spawn instead of The Negative.
* [Samael](http://steamcommunity.com/sharedfiles/filedetails/?id=897795840) is a custom character created by Ghostbroster. He is a melee character that uses his scythe to attack enemies. Samael starts with D6, the Schoolbag, the Wraith Skull, and 1 bomb.

<br />

## Individual Room Changes

The [technical specifics of all of the individual room changes are listed in a separate document](https://github.com/Zamiell/isaac-racing-client/blob/master/mod/CHANGES-ROOM.md), for those who care to know the nitty-gritty details.

<br />
