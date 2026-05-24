import { getEphemerisSnapshot } from './lib/ephemeris/getEphemerisSnapshot.js';
const snap = await getEphemerisSnapshot('KOP');
console.log(JSON.stringify({sunrise: snap.snapshot?.solar.sunrise, sunset: snap.snapshot?.solar.sunset, nextEvent: snap.nextEvent}, null,2));
