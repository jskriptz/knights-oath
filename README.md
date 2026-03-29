# The Knight's Oath

**A Choose Your Own Adventure RPG set in the Dragonlance universe**

A browser-based interactive fiction game with full D&D 5e (2024) combat, character progression, and branching narratives. Play as a Solamnic squire on the eve of the War of the Lance.

## Play Now

**[Play Online](https://jskriptz.github.io/knights-oath/)** | [Download Standalone HTML](dist/knights-oath.html)

## Features

### Story & Setting
- **320+ scenes** of branching narrative set in Krynn
- **9 companions** with unique personalities, combat abilities, and romance options
- **Multiple endings** based on your choices, honor, and relationships
- **Dragonlance lore** - the Cataclysm, the Dragon Armies, the Solamnic Orders

### Character System
- **Two classes**: Fighter (martial mastery) or Paladin (divine magic)
- **D&D 5e 2024 rules** - ability scores, skills, feats, fighting styles
- **Weapon mastery system** - Cleave, Graze, Topple, Vex, and more
- **Order alignment** - Rose, Sword, or Crown based on your choices
- **Knighting ceremony** with order-specific bonuses

### Combat
- **Turn-based tactical combat** with full 5e mechanics
- **Companion AI** - allies fight alongside you with unique abilities
- **Dynamic narrator** - combat descriptions that react to the battle
- **Equipment degradation** - weapons and armor wear down (magical items immune)
- **Mount combat** - charge bonuses when mounted

### Systems
- **Reputation tracker** - Renowned to Disgraced based on conduct
- **Camping** - manage rations and torches
- **Romance** - build relationships that affect the story
- **Approval system** - companions react to your choices
- **DM Summary** - exportable chronicle for tabletop continuation

## Screenshots

The game features a dark fantasy aesthetic with gold accents, dynamic combat UI, and a collapsible sidebar for character management.

## Technical Details

- **Pure browser game** - no server, no accounts, no tracking
- **Single HTML file** - can be played offline
- **React 18** - loaded from CDN
- **LocalStorage saves** - your progress stays in your browser
- **Mobile responsive** - playable on phones and tablets

### Progressive Web App (PWA)

Install directly from your browser:
- **Desktop**: Click the install icon in the address bar
- **Mobile**: "Add to Home Screen" from browser menu
- **Offline play**: Service worker caches all game assets
- **Shortcuts**: Quick access to "Continue Game" and "New Character"

### Native Mobile (Capacitor)

Build as a native Android/iOS app:

| Platform | Status | App ID |
|----------|--------|--------|
| Android | Ready | `com.knightsoath.game` |
| iOS | Scaffolded | `com.knightsoath.game` |

### Project Structure
```
index.html                    # Game engine (~6500 lines)
manifest.json                 # PWA manifest
sw.js                         # Service worker (offline caching)
capacitor.config.ts           # Native app config
campaigns/knights-oath/       # Campaign data
  campaign.json              # Manifest
  scenes.json                # Primary scenes
  scenes-deferred.json       # Lazy-loaded scenes
  companions.json            # Companion data
  combat-narration.json      # Dynamic combat text
  ...
dist/knights-oath.html       # Standalone build
android/                      # Native Android project
```

## Development

### Build Standalone HTML
```bash
node scripts/build-standalone.js
```

### Sync to Android (Capacitor)
```bash
npm run sync                  # Copy web files to www/ and sync
npx cap open android          # Open in Android Studio
```

### Build Android APK
```bash
cd android
./gradlew assembleDebug       # Debug APK in app/build/outputs/apk/
./gradlew assembleRelease     # Release APK (requires signing)
```

## Version History

- **v24.5.1** - Magical item immunity to degradation
- **v24.5.0** - Equipment degradation, camping, mount combat, reputation
- **v24.4.9** - Knighting ceremony system
- **v24.3.8** - Language system, magic equipment
- Earlier versions focused on scene content and combat systems

## Credits

**Game Design, Writing & Code**: J. Carlo

**Setting**: Dragonlance is a trademark of Wizards of the Coast. This is a fan project and is not affiliated with or endorsed by Wizards of the Coast.

**Rules**: Based on D&D 5th Edition (2024) under the Open Gaming License.

## License

The code is provided as-is for personal use. The Dragonlance setting and D&D mechanics are property of their respective owners.

---

*Est Sularus oth Mithas* — My honour is my life.
