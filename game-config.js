// Master game content. Only the repository owner can change the published version.
// Family names and roles are published with the owner's explicit approval.
window.GAME_CONFIG = {
  title: "Kryspinów Family Go!",
  currencySymbol: "F",
  startingCoins: 1500,

  characters: [
    { id: "luca", name: "Luca", role: "Father", emoji: "👨🏻", avatarImage: "", colour: "#315b9b" },
    { id: "sylwia", name: "Sylwia", role: "Mother", emoji: "👩🏻", avatarImage: "", colour: "#f18a3d" },
    { id: "oli", name: "Oli", role: "Son", emoji: "👦🏼", avatarImage: "", colour: "#ef5b62" },
    { id: "vicky", name: "Vicky", role: "Daughter", emoji: "👧🏻", avatarImage: "", colour: "#e36aaa" }
  ],

  boardSpaces: [
    { id: "go", label: "GO!", emoji: "🚀", row: 5, column: 1, type: "go" },
    { id: "home", label: "Family Home", emoji: "🏠", row: 5, column: 2, type: "venue" },
    { id: "star-one", label: "Lucky Star", emoji: "⭐", row: 5, column: 3, type: "special" },
    { id: "playground", label: "Playground", emoji: "🛝", row: 5, column: 4, type: "venue" },
    { id: "gift", label: "Family Gift", emoji: "🎁", row: 5, column: 5, type: "special" },
    { id: "football", label: "Football Pitch", emoji: "⚽", row: 4, column: 5, type: "venue" },
    { id: "challenge-one", label: "Challenge", emoji: "🏆", row: 3, column: 5, type: "challenge" },
    { id: "forest", label: "Forest Walk", emoji: "🌳", row: 2, column: 5, type: "venue" },
    { id: "free-stop", label: "Family Break", emoji: "🧃", row: 1, column: 5, type: "rest" },
    { id: "lake", label: "Lake Club", emoji: "🏖️", row: 1, column: 4, type: "venue" },
    { id: "star-two", label: "Lucky Star", emoji: "⭐", row: 1, column: 3, type: "special" },
    { id: "ice-cream", label: "Ice-Cream", emoji: "🍦", row: 1, column: 2, type: "venue" },
    { id: "surprise", label: "Surprise", emoji: "❔", row: 1, column: 1, type: "special" },
    { id: "teddy-cafe", label: "Teddy Café", emoji: "🧸", row: 2, column: 1, type: "venue" },
    { id: "challenge-two", label: "Challenge", emoji: "🏆", row: 3, column: 1, type: "challenge" },
    { id: "bike", label: "Bike Ride", emoji: "🚲", row: 4, column: 1, type: "venue" }
  ],

  venues: [
    { id: "home", name: "Family Home", price: 100, upgradePrices: [150, 250, 400] },
    { id: "playground", name: "Kryspinów Playground", price: 140, upgradePrices: [200, 320, 500] },
    { id: "ice-cream", name: "Lake Ice-Cream Stop", price: 180, upgradePrices: [260, 420, 650] },
    { id: "football", name: "Oli's Football Pitch", price: 220, upgradePrices: [310, 490, 760] },
    { id: "teddy-cafe", name: "Vicky's Teddy Café", price: 260, upgradePrices: [370, 580, 900] },
    { id: "lake", name: "Kryspinów Lake Club", price: 320, upgradePrices: [450, 700, 1100] }
  ],

  challenges: [
    { id: "dance", title: "Dance Challenge", instruction: "Invent a ten-second victory dance.", reward: 100 },
    { id: "mime", title: "Family Mime", instruction: "Mime an animal until somebody guesses it.", reward: 120 },
    { id: "kindness", title: "Kindness Bonus", instruction: "Say something kind about another player.", reward: 150 },
    { id: "tower", title: "Speed Builder", instruction: "Build the tallest block tower in one minute.", reward: 180 }
  ]
};
