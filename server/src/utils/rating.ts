export interface GlickoRating {
  rating: number;
  rd: number;
  volatility: number;
}

const TAU = 0.5;
const EPSILON = 0.000001;
const GLICKO2_SCALE = 173.7178;

function toGlicko2Scale(rating: number, rd: number) {
  return {
    mu: (rating - 1500) / GLICKO2_SCALE,
    phi: rd / GLICKO2_SCALE,
  };
}

function fromGlicko2Scale(mu: number, phi: number) {
  return {
    rating: mu * GLICKO2_SCALE + 1500,
    rd: phi * GLICKO2_SCALE,
  };
}

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function E(mu: number, muJ: number, phiJ: number): number {
  return 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));
}

export function calculateNewRating(
  player: GlickoRating,
  opponent: GlickoRating,
  score: number
): GlickoRating {
  const p = toGlicko2Scale(player.rating, player.rd);
  const o = toGlicko2Scale(opponent.rating, opponent.rd);

  const gPhiJ = g(o.phi);
  const eVal = E(p.mu, o.mu, o.phi);

  const v = 1 / (gPhiJ * gPhiJ * eVal * (1 - eVal));
  const delta = v * gPhiJ * (score - eVal);

  const a = Math.log(player.volatility * player.volatility);
  const phiSq = p.phi * p.phi;

  function f(x: number): number {
    const eX = Math.exp(x);
    const d2 = delta * delta;
    const h = phiSq + v + eX;
    return ((eX * (d2 - phiSq - v - eX)) / (2 * h * h)) - ((x - a) / (TAU * TAU));
  }

  let A = a;
  let B: number;

  if (delta * delta > phiSq + v) {
    B = Math.log(delta * delta - phiSq - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) k++;
    B = a - k * TAU;
  }

  let fA = f(A);
  let fB = f(B);

  while (Math.abs(B - A) > EPSILON) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA = fA / 2;
    }
    B = C;
    fB = fC;
  }

  const newVolatility = Math.exp(A / 2);
  const phiStar = Math.sqrt(phiSq + newVolatility * newVolatility);
  const newPhi = 1 / Math.sqrt((1 / (phiStar * phiStar)) + (1 / v));
  const newMu = p.mu + newPhi * newPhi * gPhiJ * (score - eVal);

  const result = fromGlicko2Scale(newMu, newPhi);

  return {
    rating: Math.round(Math.max(100, result.rating)),
    rd: Math.max(30, Math.min(350, result.rd)),
    volatility: newVolatility,
  };
}

export function getDefaultRating(): GlickoRating {
  return { rating: 1500, rd: 350, volatility: 0.06 };
}