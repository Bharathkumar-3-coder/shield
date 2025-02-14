// Convert numbers to Telugu words
export function numberToTelugu(num: number): string {
  const units = ['', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది'];
  const teens = ['పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పద్నాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పద్దెనిమిది', 'పందొమ్మిది'];
  const tens = ['', 'పది', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్భై', 'ఎనభై', 'తొంభై'];

  if (num === 0) return 'సున్న';
  if (num < 0) return 'ఋణ ' + numberToTelugu(Math.abs(num));
  if (num < 10) return units[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const digit = num % 10;
    return tens[Math.floor(num / 10)] + (digit ? ' ' + units[digit] : '');
  }
  return num.toString();
}