export interface Membership {
  id: string;
  name: string;
  brandColor: string;
  memberId: string;
  logo: string;
}

export interface Perk {
  id: string;
  membershipId: string;
  membershipName: string;
  brandColor: string;
  title: string;
  value: string;
  category: 'auto' | 'dining' | 'travel' | 'shopping' | 'health';
  image: string;
  distance: string;
  venue: string;
  howToRedeem: string;
}

export const MEMBERSHIPS: Record<string, Membership> = {
  aaa: {
    id: 'aaa',
    name: 'AAA',
    brandColor: '#D32F2F',
    memberId: '4298 7710 3342 0091',
    logo: '🛡️',
  },
  aarp: {
    id: 'aarp',
    name: 'AARP',
    brandColor: '#1A237E',
    memberId: '2201 8834 5567',
    logo: '🏛️',
  },
  chase: {
    id: 'chase',
    name: 'Chase Sapphire Reserve',
    brandColor: '#1565C0',
    memberId: '4147 8830 2219 0054',
    logo: '💳',
  },
  costco: {
    id: 'costco',
    name: 'Costco Executive',
    brandColor: '#E53935',
    memberId: '1109 4423 8871',
    logo: '🏪',
  },
  amex: {
    id: 'amex',
    name: 'Amex Platinum',
    brandColor: '#37474F',
    memberId: '3782 8224 6310 005',
    logo: '✨',
  },
};

export const MOCK_PERKS: Record<string, Perk[]> = {
  aaa: [
    { id: 'aaa-1', membershipId: 'aaa', membershipName: 'AAA', brandColor: '#D32F2F', title: 'Free 200mi Towing', value: 'Save $350+', category: 'auto', image: 'https://images.unsplash.com/photo-1449965408869-ebd3fee7e6c3?w=400&h=250&fit=crop', distance: '—', venue: 'Nationwide', howToRedeem: 'Call AAA Roadside at 1-800-222-4357 or use the AAA app to request service.' },
    { id: 'aaa-2', membershipId: 'aaa', membershipName: 'AAA', brandColor: '#D32F2F', title: '15% Off at Denny\'s', value: '15% Off', category: 'dining', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop', distance: '0.4 mi', venue: 'Denny\'s', howToRedeem: 'Show your AAA membership card to your server before ordering. Discount applied to total bill.' },
    { id: 'aaa-3', membershipId: 'aaa', membershipName: 'AAA', brandColor: '#D32F2F', title: 'Up to 35% Off Hertz', value: '35% Off', category: 'travel', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=400&h=250&fit=crop', distance: '2.1 mi', venue: 'Hertz Rental', howToRedeem: 'Book through aaa.com/hertz or use code CDP# 0164800 at hertz.com.' },
    { id: 'aaa-4', membershipId: 'aaa', membershipName: 'AAA', brandColor: '#D32F2F', title: 'Lens Crafters 30% Off', value: '30% Off', category: 'health', image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=250&fit=crop', distance: '1.8 mi', venue: 'LensCrafters', howToRedeem: 'Present AAA card at checkout. Valid on lenses, frames, and lens options.' },
  ],
  aarp: [
    { id: 'aarp-1', membershipId: 'aarp', membershipName: 'AARP', brandColor: '#1A237E', title: '15% Off Total Bill', value: '15% Off', category: 'dining', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop', distance: '0.4 mi', venue: 'Denny\'s', howToRedeem: 'Show your AARP membership card to your server. Valid all day, every day.' },
    { id: 'aarp-2', membershipId: 'aarp', membershipName: 'AARP', brandColor: '#1A237E', title: '25% Off Wyndham Hotels', value: '25% Off', category: 'travel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop', distance: '—', venue: 'Wyndham Hotels', howToRedeem: 'Book at wyndhamhotels.com and enter your AARP member number at checkout.' },
    { id: 'aarp-3', membershipId: 'aarp', membershipName: 'AARP', brandColor: '#1A237E', title: 'Walgreens Rewards+', value: '20% Off', category: 'health', image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=250&fit=crop', distance: '0.7 mi', venue: 'Walgreens', howToRedeem: 'Link AARP to your Walgreens Balance Rewards for automatic savings on eligible items.' },
  ],
  chase: [
    { id: 'chase-1', membershipId: 'chase', membershipName: 'Chase Sapphire', brandColor: '#1565C0', title: 'Priority Pass Lounges', value: 'Free Access', category: 'travel', image: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=400&h=250&fit=crop', distance: '—', venue: 'Airport Lounges', howToRedeem: 'Present your Priority Pass membership card or digital pass at the lounge entrance.' },
    { id: 'chase-2', membershipId: 'chase', membershipName: 'Chase Sapphire', brandColor: '#1565C0', title: '3x Points on Dining', value: '3x Points', category: 'dining', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop', distance: '0.2 mi', venue: 'All Restaurants', howToRedeem: 'Simply pay with your Chase Sapphire Reserve card. Points are automatically earned.' },
    { id: 'chase-3', membershipId: 'chase', membershipName: 'Chase Sapphire', brandColor: '#1565C0', title: '$50 Hotel Credit', value: '$50 Credit', category: 'travel', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=250&fit=crop', distance: '—', venue: 'Hotels via Chase', howToRedeem: 'Book through Chase Ultimate Rewards portal. $50 credit applied automatically per stay.' },
    { id: 'chase-4', membershipId: 'chase', membershipName: 'Chase Sapphire', brandColor: '#1565C0', title: 'DoorDash DashPass', value: 'Free 1yr', category: 'dining', image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=400&h=250&fit=crop', distance: '—', venue: 'DoorDash', howToRedeem: 'Activate through Chase benefits portal. Free delivery & reduced fees on eligible orders.' },
  ],
  costco: [
    { id: 'costco-1', membershipId: 'costco', membershipName: 'Costco', brandColor: '#E53935', title: '2% Cash Back', value: '2% Back', category: 'shopping', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=250&fit=crop', distance: '3.2 mi', venue: 'Costco Warehouse', howToRedeem: 'Annual 2% reward (up to $1,250) issued as a certificate with your Executive membership.' },
    { id: 'costco-2', membershipId: 'costco', membershipName: 'Costco', brandColor: '#E53935', title: 'Costco Optical', value: '$50–100 Off', category: 'health', image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=250&fit=crop', distance: '3.2 mi', venue: 'Costco Optical', howToRedeem: 'Visit the Costco Optical department. No appointment needed for glasses.' },
    { id: 'costco-3', membershipId: 'costco', membershipName: 'Costco', brandColor: '#E53935', title: 'Costco Travel Deals', value: 'Up to 40% Off', category: 'travel', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop', distance: '—', venue: 'Costco Travel', howToRedeem: 'Book at costcotravel.com. Exclusive packages with Costco Shop Cards included.' },
  ],
  amex: [
    { id: 'amex-1', membershipId: 'amex', membershipName: 'Amex Platinum', brandColor: '#37474F', title: 'Centurion Lounges', value: 'Free Access', category: 'travel', image: 'https://images.unsplash.com/photo-1540339832862-474599807836?w=400&h=250&fit=crop', distance: '—', venue: 'Centurion Lounges', howToRedeem: 'Present your Amex Platinum card and same-day boarding pass at the lounge.' },
    { id: 'amex-2', membershipId: 'amex', membershipName: 'Amex Platinum', brandColor: '#37474F', title: 'Saks Fifth Avenue', value: '$100 Credit', category: 'shopping', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop', distance: '1.5 mi', venue: 'Saks Fifth Avenue', howToRedeem: 'Enroll via Amex app. $50 credit Jan–Jun, $50 Jul–Dec. Auto-applied when you pay with Platinum.' },
    { id: 'amex-3', membershipId: 'amex', membershipName: 'Amex Platinum', brandColor: '#37474F', title: '5x on Flights', value: '5x Points', category: 'travel', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=400&h=250&fit=crop', distance: '—', venue: 'Airlines Direct', howToRedeem: 'Book flights directly with airlines or through amextravel.com. Points earned automatically.' },
    { id: 'amex-4', membershipId: 'amex', membershipName: 'Amex Platinum', brandColor: '#37474F', title: 'Uber Cash', value: '$200/yr', category: 'auto', image: 'https://images.unsplash.com/photo-1449965408869-ebd3fee7e6c3?w=400&h=250&fit=crop', distance: '—', venue: 'Uber / Uber Eats', howToRedeem: 'Link Platinum card in the Uber app. $15/mo + $20 bonus in Dec auto-added as Uber Cash.' },
  ],
};

export const CATEGORY_LABELS: Record<string, string> = {
  auto: 'Auto',
  dining: 'Dining',
  travel: 'Travel',
  shopping: 'Shopping',
  health: 'Health',
};
