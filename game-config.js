// Master game content. Only the repository owner can change the published version.
// Family names and roles are published with the owner's explicit approval.
window.GAME_CONFIG = {
  title: "Kryspinów Family Go!",
  currencySymbol: "F",
  startingCoins: 1500,

  characters: [
    { id: "luca", name: "Luca", role: "Father", emoji: "👨🏻", avatarImage: "", colour: "#315b9b" },
    { id: "sylwia", name: "Sylwia", role: "Mother", emoji: "👩🏻", avatarImage: "", colour: "#f18a3d" },
    { id: "oli", name: "Oli", role: "Son", emoji: "👦🏼", avatarImage: "assets/oli-avatar.png", colour: "#ef5b62" },
    { id: "vicky", name: "Vicky", role: "Daughter", emoji: "👧🏻", avatarImage: "", colour: "#e36aaa" }
  ],

  boardSpaces: [
    { id: "go", label: "GO!", emoji: "🚀", row: 5, column: 1, type: "go" },
    { id: "playground", label: "Plac Zabaw Kryspinów", emoji: "🛝", row: 5, column: 2, type: "venue" },
    { id: "krakows-eye", label: "Krakow's Eye", emoji: "🎡", row: 5, column: 3, type: "venue" },
    { id: "lotnik", label: "Lotnik Kryspinów", emoji: "🏖️", row: 5, column: 4, type: "venue" },
    { id: "chance-one", label: "Chance", emoji: "❔", row: 5, column: 5, type: "special" },
    { id: "aqua-park", label: "Aqua-park Kraków", emoji: "🌊", row: 4, column: 5, type: "venue" },
    { id: "oli-vicky-home", label: "Oli & Vicky Home", emoji: "🏠", row: 3, column: 5, type: "venue" },
    { id: "shape", label: "Shape Siłownia & Fitness", emoji: "💪", row: 2, column: 5, type: "venue" },
    { id: "free-parking", label: "Free Parking", emoji: "🅿️", row: 1, column: 5, type: "rest" },
    { id: "main-plaza", label: "Main Plaza Kryspinów", emoji: "☀️", row: 1, column: 4, type: "venue" },
    { id: "energylandia", label: "Energylandia", emoji: "🎢", row: 1, column: 3, type: "venue" },
    { id: "hotel-forum", label: "Hotel Forum", emoji: "🏨", row: 1, column: 2, type: "venue" },
    { id: "chance-two", label: "Chance", emoji: "❔", row: 1, column: 1, type: "special" },
    { id: "park-decjusza", label: "Park Decjusza", emoji: "🌳", row: 2, column: 1, type: "venue" },
    { id: "legenda-krakowa", label: "Legenda Krakowa", emoji: "⭐", row: 3, column: 1, type: "special" },
    { id: "krakow-balloon", label: "Krakow Balloon", emoji: "🎈", row: 4, column: 1, type: "venue" }
  ],

  venues: [
    { id: "playground", name: "Plac Zabaw Kryspinów", price: 60, rent: 10, upgradePrices: [100, 160, 240] },
    { id: "krakows-eye", name: "Krakow's Eye", price: 80, rent: 15, upgradePrices: [120, 190, 280] },
    { id: "lotnik", name: "Lotnik Kryspinów", price: 100, rent: 20, upgradePrices: [150, 230, 340] },
    { id: "aqua-park", name: "Aqua-park Kraków", price: 120, rent: 25, upgradePrices: [180, 280, 420] },
    { id: "oli-vicky-home", name: "Oli & Vicky Home", price: 140, rent: 30, upgradePrices: [210, 330, 500] },
    { id: "shape", name: "Shape Siłownia & Fitness", price: 160, rent: 35, upgradePrices: [240, 380, 570] },
    { id: "main-plaza", name: "Main Plaza Kryspinów", price: 180, rent: 40, upgradePrices: [270, 420, 640] },
    { id: "energylandia", name: "Energylandia", price: 200, rent: 45, upgradePrices: [300, 470, 710] },
    { id: "hotel-forum", name: "Hotel Forum", price: 220, rent: 50, upgradePrices: [330, 520, 780] },
    { id: "park-decjusza", name: "Park Decjusza", price: 240, rent: 55, upgradePrices: [360, 560, 850] },
    { id: "krakow-balloon", name: "Krakow Balloon", price: 260, rent: 60, upgradePrices: [390, 610, 920] }
  ],

  challenges: [
    { id: "dance", title: "Dance Challenge", instruction: "Invent a ten-second victory dance.", reward: 100 },
    { id: "mime", title: "Family Mime", instruction: "Mime an animal until somebody guesses it.", reward: 120 },
    { id: "kindness", title: "Kindness Bonus", instruction: "Say something kind about another player.", reward: 150 },
    { id: "tower", title: "Speed Builder", instruction: "Build the tallest block tower in one minute.", reward: 180 }
  ]
};
