// config.js
 const nations = [
  { name: 'Estados Unidos', emoji: '🇺🇸', color: '#1E3A5F' },
  { name: 'Italia', emoji: '🇮🇹', color: '#006B3C' },
  { name: 'Japón', emoji: '🇯🇵', color: '#BC002D' },
  { name: 'Alemania', emoji: '🇩🇪', color: '#000000' },
  { name: 'Unión Soviética', emoji: '🇷🇺', color: '#CC0000' },
  { name: 'Inglaterra', emoji: '🇬🇧', color: '#00247D' },
  { name: 'Francia', emoji: '🇫🇷', color: '#0055A4' }
];

const missions = {
  objectives: [
    "Seek and Destroy",
    "Key Positions",
    "Breakthrough",
    "Top Secret",
    "Demolition",
    "Hold Until Relieved"
  ],
  objectivesInfo: [
    "Destruye unidades enemigas. Ganas 1 punto por unidad destruida. Ganas si tienes al menos 2 pts más.",
    "Controla más objetivos en el mapa al final del juego.",
    "Llega al borde enemigo (3 pts) o entra en su zona (1 pt por unidad).",
    "Captura el maletín en el centro del mapa y llévalo fuera por tu borde.",
    "Destruye la base enemiga. Si ambas caen el mismo turno, es empate.",
    "Controla el objetivo central al final del juego."
  ],
  zones: [
    "Long Edges",
    "Long Edges",
    "Long Edges",
    "Quarters",
    "Quarters",
    "Quarters"
  ],
  zonesInfo: [
    "Zonas de despliegue enfrentadas en los bordes largos del mapa.",
    "Zonas de despliegue enfrentadas en los bordes largos del mapa.",
    "Zonas de despliegue enfrentadas en los bordes largos del mapa.",
    "Cada jugador se despliega en un cuarto del mapa, diagonal opuesta.",
    "Cada jugador se despliega en un cuarto del mapa, diagonal opuesta.",
    "Cada jugador se despliega en un cuarto del mapa, diagonal opuesta."
  ],
  types: [
    "Meeting Engagement",
    "Meeting Engagement",
    "Meeting Engagement",
    "Prepared Positions",
    "Prepared Positions",
    "Fog of War"
  ],
  typesInfo: [
    "Las unidades llegan en la primera ola desde el borde propio. No hay unidades desplegadas inicialmente.",
    "Las unidades llegan en la primera ola desde el borde propio. No hay unidades desplegadas inicialmente.",
    "Las unidades llegan en la primera ola desde el borde propio. No hay unidades desplegadas inicialmente.",
    "Se colocan unidades alternadas en zona de despliegue, con reservas limitadas.",
    "Se colocan unidades alternadas en zona de despliegue, con reservas limitadas.",
    "Se despliegan como en Prepared Positions pero con más reservas. No hay flanqueo."
  ]
};

 const orderIcons = {
  Advance: '➡️',
  Run: '🏃‍♂️',
  Ambush: '👀',
  Fire: '🔥',
  Rally: '🛡️',
  Down: '⬇️'
};
