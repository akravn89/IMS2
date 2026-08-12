export const event = {
  id: 'IMC-2026',
  name: 'Ericsson IMC 2026',
  venue: 'Pragati Maidan, New Delhi',
  dates: '2026-10-14 to 2026-10-16',
  rewardRule: { pointsPerBooth: 10, giftEligibleAtUniqueBooths: 10 }
};

export const attendees = [
  { id: 'IMC001', name: 'Priya Sharma', mobile: '+919810000001', language: 'en', points: 0 },
  { id: 'IMC002', name: 'Rahul Mehta', mobile: '+919810000002', language: 'en', points: 0 },
  { id: 'IMC003', name: 'Aisha Khan', mobile: '+919810000003', language: 'en', points: 0 },
  { id: 'IMC004', name: 'John Smith', mobile: '+447700900004', language: 'en', points: 0 },
  { id: 'IMC005', name: 'Sara Ahmed', mobile: '+971500000005', language: 'en', points: 0 }
];

export const booths = [
  { id: 'B01', zone: 'Zone 1', name: 'AI Gallery', location: 'Hall A · A12', description: 'AI demonstrations and intelligent automation use cases.' },
  { id: 'B02', zone: 'Zone 1', name: 'Security Table Demo', location: 'Hall A · A14', description: 'Security demonstrations for telecom and enterprise networks.' },
  { id: 'B03', zone: 'Zone 2', name: '5G Experience', location: 'Hall B · B05', description: '5G network, device and immersive experience demonstrations.' },
  { id: 'B04', zone: 'Zone 3', name: 'Cloud Platform', location: 'Hall B · B10', description: 'Cloud-native platform and infrastructure demonstrations.' },
  { id: 'B05', zone: 'Zone 4', name: 'Network Automation', location: 'Hall C · C03', description: 'Closed-loop automation and operations demonstrations.' },
  { id: 'B06', zone: 'Zone 5', name: 'Private Networks', location: 'Hall C · C08', description: 'Private 5G and enterprise connectivity solutions.' },
  { id: 'B07', zone: 'Zone 6', name: 'IoT Studio', location: 'Hall D · D02', description: 'IoT connectivity, devices and industrial use cases.' },
  { id: 'B08', zone: 'Zone 7', name: 'Developer Experience', location: 'Hall D · D07', description: 'APIs, developer tooling and programmable network demos.' },
  { id: 'B09', zone: 'Zone 8', name: 'Sustainability Lab', location: 'Hall E · E04', description: 'Energy efficiency and sustainable network operations.' },
  { id: 'B10', zone: 'Zone 9', name: 'Future Networks', location: 'Hall E · E09', description: 'Research concepts and next-generation network demonstrations.' }
];

export const sessions = [
  { id: 'S01', title: 'AI-Native Networks', time: '10:30', location: 'Main Stage', speaker: 'Dr. Maya Rao' },
  { id: 'S02', title: '5G for Enterprise', time: '12:00', location: 'Forum 2', speaker: 'Arjun Malhotra' },
  { id: 'S03', title: 'Securing Programmable Networks', time: '14:30', location: 'Forum 1', speaker: 'Nadia Hassan' }
];

export const knowledge = [
  { keywords: ['wifi', 'internet'], answer: 'Guest Wi-Fi is available throughout the venue. Connect to “IMC-Guest” and follow the captive-portal instructions.' },
  { keywords: ['registration', 'help desk', 'badge'], answer: 'The registration and help desk is at the main entrance. Please carry your registration confirmation or badge.' },
  { keywords: ['gift', 'reward'], answer: 'Visit 10 unique booths to become gift-eligible. Each unique booth check-in earns 10 points in this sample event.' },
  { keywords: ['food', 'lunch', 'cafe'], answer: 'Food and refreshments are available in the central hospitality area near Hall C.' }
];
