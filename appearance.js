import {dateLabel} from './calendar-data.js?v=0.6.0';

// Nicole's selected designs: main date ribbon 7, compact calendar stamp 4.
export function dateBadge(day){return `<div class="date-stamp badge-7" aria-label="${dateLabel(day)}"><strong>${day.day}</strong><span>${dateLabel(day,{month:'short'})}</span></div>`;}
export function countBadge(count){return `<span class="cell-total count-4" aria-label="${count} events"><span class="count-number">${count}</span></span>`;}
