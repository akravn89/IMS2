export const event = {
  id: 'IMC2026',
  name: 'IMC 2026',
  botName: 'Ericsson IMC AI',
  venue: 'Pragati Maidan, New Delhi',
  dates: '2026-10-14 to 2026-10-16',
  rewardBoothTarget: 10,
  pointsPerBooth: 10,
};

export const attendees = [
  { id: 'IMC001', name: 'Priya Sharma', mobile: '+919810000001', optedIn: true },
  { id: 'IMC002', name: 'Rahul Mehta', mobile: '+919810000002', optedIn: true },
  { id: 'IMC003', name: 'Aisha Khan', mobile: '+919810000003', optedIn: true },
  { id: 'IMC004', name: 'John Smith', mobile: '+447700900004', optedIn: true },
  { id: 'IMC005', name: 'Sara Ahmed', mobile: '+971500000005', optedIn: true },
];

export const zones = Array.from({ length: 12 }, (_, i) => ({
  id: `Z${String(i + 1).padStart(2, '0')}`,
  name: `Zone ${i + 1}`,
  location: `Hall ${String.fromCharCode(65 + Math.floor(i / 4))}`,
}));

export const booths = Array.from({ length: 12 }, (_, i) => ({
  id: `B${String(i + 1).padStart(2, '0')}`,
  zoneId: zones[i].id,
  name: [
    'AI Gallery', 'Security Demo', '5G Experience', 'Cloud Platform',
    'Network Automation', 'Private Networks', 'XR Experience', 'API Marketplace',
    'Sustainability Lab', 'Enterprise Wireless', 'Developer Studio', 'Innovation Hub',
  ][i],
  location: `${zones[i].location} - Booth ${i + 1}`,
  description: `Demo and product information for ${[
    'AI Gallery', 'Security Demo', '5G Experience', 'Cloud Platform',
    'Network Automation', 'Private Networks', 'XR Experience', 'API Marketplace',
    'Sustainability Lab', 'Enterprise Wireless', 'Developer Studio', 'Innovation Hub',
  ][i]}.`,
}));

export const sessions = [
  { id: 'S01', title: 'AI-Native Networks', time: '10:30', location: 'Main Stage' },
  { id: 'S02', title: 'Securing 5G Enterprises', time: '12:00', location: 'Hall A' },
  { id: 'S03', title: 'Network Automation at Scale', time: '14:00', location: 'Hall B' },
  { id: 'S04', title: 'Future of Private Networks', time: '15:30', location: 'Hall C' },
];
