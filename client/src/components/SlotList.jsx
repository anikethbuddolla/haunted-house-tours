import { formatTime, spotsText } from '../utils/formatTime.js'

// SlotList: one row per tour slot showing its time and spots left.
// A full slot shows "Full" and its Book button is disabled.
// Props: slots (from HousePage's fetch), selectedSlotId, and onPick (selects a slot in the form).
function SlotList({ slots, selectedSlotId, onPick }) {
  return (
    <ul className="slot-list">
      {slots.map((slot) => {
        const full = slot.spots_left === 0
        const selected = String(slot.id) === selectedSlotId
        return (
          <li key={slot.id} className={selected ? 'slot selected' : 'slot'}>
            <span className="slot-time">{formatTime(slot.start_time)}</span>
            <span className={full ? 'slot-spots full' : 'slot-spots'}>{spotsText(slot.spots_left)}</span>
            <button onClick={() => onPick(String(slot.id))} disabled={full}>
              {full ? 'Full' : selected ? 'Selected' : 'Book'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default SlotList
