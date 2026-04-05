// Educational descriptions for celestial bodies, keyed by body id.
// Each description is 2-3 sentences meant to give the user a quick
// mental model of what they're looking at.

export const BODY_DESCRIPTIONS: Record<string, string> = {
  sun: "A G-type main-sequence star containing 99.86% of the solar system's mass. Powered by hydrogen fusion in its core, it produces the energy that sustains life on Earth and drives the heliosphere outward for more than 100 AU.",

  // Planets
  mercury:
    "The smallest planet and closest to the Sun, Mercury is a cratered rocky world with virtually no atmosphere. Surface temperatures swing from 430\u00b0C in daylight to \u2212180\u00b0C at night \u2014 the widest range of any planet.",
  venus:
    "Earth's sister in size but a runaway greenhouse hell. Venus's thick CO\u2082 atmosphere traps heat so effectively that its surface reaches 465\u00b0C, hot enough to melt lead and making it the hottest planet in the solar system.",
  earth:
    "The only known world with life. Earth has liquid water oceans, a protective magnetosphere, and a breathable nitrogen-oxygen atmosphere. Its axial tilt gives us seasons, and a single large moon stabilizes its rotation.",
  mars: "The Red Planet owes its color to iron oxide dust covering its surface. Once warmer and wetter, Mars now hosts the tallest volcano (Olympus Mons) and deepest canyon (Valles Marineris) in the solar system, and is the prime target for human exploration.",
  jupiter:
    "The solar system's largest planet \u2014 a gas giant more than twice the mass of all other planets combined. Its Great Red Spot is a storm larger than Earth that has raged for at least 400 years, and its strong gravity shields inner planets from many comets.",
  saturn:
    "Famed for its spectacular ring system of billions of ice and rock particles, Saturn is the least dense planet in the solar system \u2014 so light it would float in a large-enough ocean. Its rings are thousands of kilometers wide but only tens of meters thick.",
  uranus:
    "An ice giant tipped on its side with a 98\u00b0 axial tilt, Uranus rolls around the Sun like a ball. Its pale cyan color comes from methane in the atmosphere, and each pole experiences 42 years of continuous sunlight followed by 42 years of darkness.",
  neptune:
    "The windiest planet in the solar system, Neptune has supersonic storms exceeding 2,100 km/h. This deep-blue ice giant was the first planet found by mathematical prediction rather than observation, and its largest moon Triton orbits backward.",

  // Dwarf planets
  pluto:
    "Once the ninth planet, Pluto was reclassified as a dwarf planet in 2006. NASA's New Horizons revealed in 2015 that it's a surprisingly active world with nitrogen glaciers, water-ice mountains, and a possible subsurface ocean.",
  ceres:
    "The largest object in the asteroid belt and closest dwarf planet to the Sun, Ceres contains about a third of the belt's total mass. The Dawn spacecraft found bright salt deposits pointing to a briny subsurface ocean in its past.",
  eris: 'One of the largest known dwarf planets, Eris lies far beyond Pluto in the scattered disc. Its discovery in 2005 directly triggered the redefinition of "planet" that demoted Pluto from the main lineup.',
  haumea:
    "A strangely elongated dwarf planet spinning so fast \u2014 a day of just four hours \u2014 that it's stretched into an egg shape. It has a thin ring system and two small known moons.",
  makemake:
    "A frigid icy dwarf planet in the Kuiper Belt, slightly smaller than Pluto. Its surface is covered in frozen methane and ethane, giving it a faint reddish tint.",
  sedna:
    "One of the most distant known objects in the solar system, Sedna follows an extreme 11,400-year elliptical orbit that never brings it closer than 76 AU to the Sun. Its deep red color makes it one of the reddest objects in the solar system, and its detached orbit hints at gravitational influence from an unseen massive body.",
  "2012-vp113":
    'Nicknamed "Biden" after its VP designation, 2012 VP₁₁₃ is a distant inner Oort Cloud object with a perihelion of ~80 AU — so far that it never interacts with the known giant planets. Along with Sedna, its unusual orbit is a key piece of evidence in the search for a hypothetical Planet Nine.',

  // Moons
  moon: "Earth's only natural satellite, formed ~4.5 billion years ago from debris left by a giant impact. Its gravitational pull drives Earth's tides, and its stable orbit keeps Earth's rotation axis from wobbling chaotically.",
  phobos:
    "The larger and closer of Mars's two tiny moons. Phobos orbits so low that it laps Mars every 7.6 hours and is slowly spiraling inward \u2014 destined to crash or break up into a ring within tens of millions of years.",
  deimos:
    "The smaller outer moon of Mars, only 12 km across. Likely a captured asteroid, Deimos crawls across the Martian sky so slowly that it takes 2.7 days to travel from horizon to horizon.",
  io: "The most volcanically active body in the solar system, Jupiter's moon Io has hundreds of active volcanoes driven by tidal heating from Jupiter and its sibling moons. Its surface is painted in sulfur yellows, reds, and whites.",
  europa:
    "Jupiter's icy moon hides a global liquid ocean beneath its frozen crust \u2014 thought to contain twice as much water as all of Earth's oceans combined. It is one of the most promising places to search for life beyond Earth.",
  ganymede:
    "The largest moon in the solar system, even bigger than Mercury. Ganymede is the only moon with its own magnetic field and is thought to contain a salty subsurface ocean.",
  callisto:
    "The most heavily cratered object in the solar system, Callisto's ancient surface preserves a record of 4 billion years of impacts. Its low radiation environment makes it a prime candidate for future crewed Jupiter missions.",
  titan:
    "Saturn's largest moon and the only moon with a substantial atmosphere \u2014 denser than Earth's. Titan has lakes and rivers of liquid methane and ethane, making it the only other body with stable surface liquids.",
  enceladus:
    "A small moon of Saturn that shoots geysers of water ice from its south pole, feeding Saturn's E ring. The plumes originate from a global subsurface ocean, making it a top target in the search for life.",
  mimas:
    "Saturn's small, heavily cratered moon, famous for the huge impact crater Herschel that gives it a striking resemblance to the Death Star from Star Wars.",
  titania:
    "The largest moon of Uranus, a mix of ice and rock with huge canyons scarring its surface that hint at ancient geological activity.",
  oberon:
    "The outermost and second-largest moon of Uranus, covered in craters and mysterious dark patches at the floors of those craters.",
  miranda:
    "The smallest of Uranus's major moons, Miranda has one of the most bizarre surfaces in the solar system \u2014 jumbled terrain and massive cliffs that look as though it was shattered and reassembled.",
  triton:
    "Neptune's largest moon orbits backward (retrograde), a clue that it was captured from the Kuiper Belt. Active nitrogen geysers make it one of only a handful of geologically active moons.",
  charon:
    "Pluto's largest moon, so big relative to Pluto that the pair is sometimes called a double dwarf planet. Its surface is scarred by a vast canyon system four times as long as the Grand Canyon.",
  dysnomia:
    "The only known moon of Eris, small and dark. Observing its orbit let astronomers measure the mass and density of its parent dwarf planet.",
  hiiaka:
    "The larger moon of Haumea, likely formed from debris knocked off during a collision that also gave Haumea its unusually fast spin.",
  namaka: "The smaller, inner moon of Haumea, named after a Hawaiian water spirit.",

  // Probes
  "voyager-1":
    "Launched in 1977, Voyager 1 is the farthest human-made object from Earth. In 2012 it became the first spacecraft to cross the heliopause into interstellar space, and it still transmits data today from over 160 AU away.",
  "voyager-2":
    "Launched in 1977, Voyager 2 is the only spacecraft to have visited all four giant planets \u2014 Jupiter, Saturn, Uranus, and Neptune. It crossed into interstellar space in 2018.",
  "pioneer-10":
    "Launched in 1972, Pioneer 10 was the first probe to travel through the asteroid belt and make close-up observations of Jupiter. Its final contact was in 2003.",
  "pioneer-11":
    "Pioneer 11 followed its sibling in 1973, flew past Jupiter, and made the first flyby of Saturn in 1979. It carries a gold plaque with a message meant for any extraterrestrial finder.",
  "new-horizons":
    "Launched in 2006, New Horizons gave humanity its first close look at Pluto during a 2015 flyby, revealing a surprisingly active world. It later flew past Arrokoth, the most distant object ever visited by a spacecraft.",

  // Comets
  halley:
    "The most famous comet in history, recorded since at least 240 BC. Halley's retrograde orbit brings it past the Sun roughly every 75 years. Its last visit in 1986 was met by a fleet of spacecraft, and its next perihelion is expected around July 2061.",
  encke:
    "With a period of just 3.3 years, Encke has the shortest known orbit of any comet. Its repeated passes near the Sun have left a trail of debris responsible for the annual Taurid meteor shower.",
  "67p":
    "The Rosetta mission's target, 67P is a rubber-duck-shaped comet just 4 km across. In 2014 the Philae lander touched down on its surface, the first soft landing on a comet nucleus.",
  wirtanen:
    "A small, hyper-active comet that made a very close approach to Earth in December 2018, passing just 0.077 AU away. It was originally the primary target for ESA's Rosetta mission before a launch delay redirected it to 67P.",
  "hale-bopp":
    "The Great Comet of 1997, visible to the naked eye for a record 18 months. Its nucleus is about 60 km across, making it one of the largest comets ever observed. It orbits at nearly 90\u00b0 to the ecliptic and won't return for roughly 2,500 years.",
  "swift-tuttle":
    "The parent body of the Perseid meteor shower, one of the most popular annual celestial events. With a nucleus 26 km wide, Swift-Tuttle is sometimes called the single most dangerous object known to humanity due to its Earth-crossing orbit. It will next visit the inner solar system around 2126.",
};

export function getBodyDescription(id: string): string | undefined {
  return BODY_DESCRIPTIONS[id];
}
