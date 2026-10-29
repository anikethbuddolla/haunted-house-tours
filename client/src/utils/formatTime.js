// Turn a slot time like "2026-10-31 19:00" into "Sat, Oct 31, 7:00 PM".
export function formatTime(startTime) {
  return new Date(startTime.replace(' ', 'T')).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// "Full" when nothing is left, otherwise "1 spot left" / "5 spots left".
export function spotsText(spotsLeft) {
  if (spotsLeft === 0) return 'Full'
  return `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`
}
