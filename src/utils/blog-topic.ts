/** Editorial browsing groups derived from the article subject. */
export function blogTopic(title: string): string {
  if (/bathroom|grab bar|anti.slip/i.test(title)) return "Bathroom safety";
  if (/distance|abroad|afar|caregiv|parents|family|missed call/i.test(title)) return "Family & caregiving";
  if (/arthritis|osteoporosis|nutrition|diet|sleep|balance|joint|healthy aging/i.test(title)) return "Healthy ageing";
  return "Safer living";
}
