/**
 * Birthday and Zodiac utility functions
 */

export interface ZodiacSign {
  name: string;
  emoji: string;
  dates: string;
}

const zodiacSigns: ZodiacSign[] = [
  { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19' },
  { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18' },
  { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20' },
  { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19' },
  { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20' },
  { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20' },
  { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22' },
  { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22' },
  { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22' },
  { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22' },
  { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21' },
];

/**
 * Calculate age from birthday
 */
export function calculateAge(birthday: Date | string): number {
  const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Calculate upcoming age (age they'll turn on next birthday)
 */
export function calculateUpcomingAge(birthday: Date | string): number {
  const currentAge = calculateAge(birthday);
  const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday;
  const today = new Date();
  
  // Check if birthday has already passed this year
  const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  if (thisYearBirthday < today) {
    return currentAge + 1;
  }
  
  return currentAge;
}

/**
 * Calculate days until next birthday
 */
export function daysUntilBirthday(birthday: Date | string): number {
  const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  nextBirthday.setHours(0, 0, 0, 0);
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get zodiac sign from birthday
 */
export function getZodiacSign(birthday: Date | string): ZodiacSign {
  const birthDate = typeof birthday === 'string' ? new Date(birthday) : birthday;
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();
  
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacSigns[0]; // Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[1]; // Aquarius
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return zodiacSigns[2]; // Pisces
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[3]; // Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[4]; // Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[5]; // Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[6]; // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[7]; // Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[8]; // Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[9]; // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[10]; // Scorpio
  return zodiacSigns[11]; // Sagittarius
}

/**
 * Check if birthday is a milestone (18, 21, 30, 40, 50, etc.)
 */
export function isMilestoneBirthday(birthday: Date | string): boolean {
  const upcomingAge = calculateUpcomingAge(birthday);
  const milestones = [18, 21, 30, 40, 50, 60, 70, 80, 90, 100];
  return milestones.includes(upcomingAge);
}

/**
 * Get milestone badge text
 */
export function getMilestoneBadge(birthday: Date | string): string | null {
  if (!isMilestoneBirthday(birthday)) return null;
  const age = calculateUpcomingAge(birthday);
  return `${age}th Birthday!`;
}

/**
 * Format birthday countdown message
 */
export function formatBirthdayCountdown(birthday: Date | string): string {
  const days = daysUntilBirthday(birthday);
  
  if (days === 0) return 'Today! 🎉';
  if (days === 1) return 'Tomorrow!';
  if (days <= 7) return `In ${days} days! 🔥`;
  if (days <= 30) return `In ${days} days`;
  if (days <= 60) return `In ${Math.ceil(days / 7)} weeks`;
  return `In ${Math.ceil(days / 30)} months`;
}

/**
 * Get relationship emoji
 */
export function getRelationshipEmoji(relationship?: string): string {
  const emojis: Record<string, string> = {
    family: '👨‍👩‍👧‍👦',
    friend: '🤝',
    colleague: '💼',
    partner: '❤️',
    other: '👤'
  };
  return emojis[relationship?.toLowerCase() || 'other'] || '👤';
}
