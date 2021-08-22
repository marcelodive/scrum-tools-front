import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  generateRandomString() {
    return Math.random().toString(36).substr(2, 5);
  }

  getMode(votes: number[]) {
    const indexedVotes = votes.reduce((indexed: { [n: number]: number }, vote) => {
      indexed[vote] = indexed[vote] ? indexed[vote] + 1 : 1;
      return indexed;
    }, {});

    return Object.keys(indexedVotes).reduce((modeCard, cardNumber: string) => {
      const safeCardNumber = Number(cardNumber);
      const modeQuantityVotes = indexedVotes[modeCard] ?? 0;
      const cardQuantityVotes = indexedVotes[safeCardNumber] ?? 0;
      if (modeQuantityVotes < cardQuantityVotes) {
        modeCard = safeCardNumber;
      } else if (modeQuantityVotes === cardQuantityVotes) {
        modeCard = (safeCardNumber > modeCard) ? safeCardNumber : modeCard;
      }
      return modeCard;
    }, 0);
  }
  
}
