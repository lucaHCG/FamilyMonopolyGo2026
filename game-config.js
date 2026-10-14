// Master game content. Only the repository owner can change the published version.
// Family names and roles are published with the owner's explicit approval.
window.GAME_CONFIG = {
  title: "Kryspinów Family Go!",
  currencySymbol: "F",
  startingCoins: 1500,

  characters: [
    { id: "luca", name: "Luca", role: "Father", emoji: "👨🏻", colour: "#315b9b" },
    { id: "sylwia", name: "Sylwia", role: "Mother", emoji: "👩🏻", colour: "#f18a3d" },
    { id: "oli", name: "Oli", role: "Son", emoji: "👦🏼", colour: "#ef5b62" },
    { id: "vicky", name: "Vicky", role: "Daughter", emoji: "👧🏻", colour: "#e36aaa" }
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
