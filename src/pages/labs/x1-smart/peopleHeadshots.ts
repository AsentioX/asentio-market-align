// Shared headshot registry for X1 AiHome (residential) and X1 AiSpaces (commercial)
import headshotJon from './assets/headshot-jon.jpg';
import headshotSusan from './assets/headshot-susan.jpg';
import headshotMaya from './assets/headshot-maya.jpg';
import headshotFedex from './assets/headshot-fedex.jpg';
import headshotUnknownRes from './assets/headshot-unknown-res.jpg';
import headshotMaria from './assets/headshot-maria.jpg';
import headshotJames from './assets/headshot-james.jpg';
import headshotMarcus from './assets/headshot-marcus.jpg';
import headshotPriya from './assets/headshot-priya.jpg';
import headshotBrightco from './assets/headshot-brightco.jpg';
import headshotUnknownCom from './assets/headshot-unknown.jpg';

// Keyed by person id (matches RES_PEOPLE / COM_PEOPLE)
export const PERSON_HEADSHOTS: Record<string, string> = {
  // Residential
  jon: headshotJon,
  sarah: headshotSusan,
  maya: headshotMaya,
  fedex: headshotFedex,
  unknown: headshotUnknownRes,
  // Commercial
  maria: headshotMaria,
  james: headshotJames,
  hvac: headshotMarcus,
  visitor: headshotPriya,
  cleaning: headshotBrightco,
  unauthorized: headshotUnknownCom,
};
