import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../interface/room';
import { Socket } from 'ngx-socket-io';
import { PokerUser } from '../interface/poker-user';
import { NewUserInfo } from '../interface/new-user-info';

@Component({
  selector: 'app-poker',
  templateUrl: './poker.component.html',
  styleUrls: ['./poker.component.scss']
})
export class PokerComponent implements OnInit {

  room: Room | undefined;
  myPokerUser: PokerUser | undefined;
  username: string = '';
  selectedCard: number = 0;
  cardNumbers: number[] = [1, 2, 3, 5, 8, 13];

  constructor(private activatedRoute: ActivatedRoute, private router: Router,
    private location: Location, private socket: Socket) { }

  ngOnInit(): void {
    this.setPropertiesFromQueryParamsOrLocalStorage();
    this.setSocketsSubscribers();
    this.setUrlToShare();
  }

  getVoteToShow(pokerUser: PokerUser): string | number {
    if (this.room?.finishedVoting) {
      return pokerUser.vote ?? '';
    } else {
      return pokerUser.vote ? '?' : '';
    }
  }

  getResultCardNumber() {
    const votes = this.room?.pokerUsers.map((pokerUser) => pokerUser.vote) || [];
    const validVotes = votes.filter((vote) => vote != null) || [];

    return votes.length ? this.getMode(validVotes as number[]) : 0;
  }

  updateUserVote(cardNumber: number) {
    if (this.myPokerUser) {
      this.myPokerUser.vote = cardNumber;
      this.updateRoomAbroad();
    }
  }

  showResults() {
    if (this.room) {
      this.room.finishedVoting = true;
      this.updateRoomAbroad();
    }
  }

  getVotePercentage() {
    const countPokerUsers = this.room?.pokerUsers.length || 1;
    const countPokersUsersWhoVoted: number = this.room?.pokerUsers.filter(
      (pokerUser) => pokerUser.vote).length || 0;
    return (countPokersUsersWhoVoted / countPokerUsers) * 100;
  }

  resetVoting() {
    if (this.room) {
      this.room.finishedVoting = false;
      this.room.pokerUsers.forEach((pokerUser) => {
        pokerUser.vote = 0;
      });
      this.updateRoomAbroad();
    }
  }

  private getMode(votes: number[]) {
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

  private setSocketsSubscribers() {
    this.socket.fromEvent('room updated').subscribe((room) => {
      this.room = room as Room;
      this.setMyPokerUser();
    });

    this.socket.fromEvent('new user enter poker room').subscribe((newUserInfo) => {
      const userInfo: NewUserInfo = newUserInfo as NewUserInfo;
      const pokerUser: PokerUser = { name: userInfo?.username };
      this.room?.pokerUsers.push(pokerUser);
      this.updateRoomAbroad();
    });
  }

  private setPropertiesFromQueryParamsOrLocalStorage() {
    this.activatedRoute.queryParams.subscribe(({ stringifiedRoom, username, roomId }) => {
      if (stringifiedRoom) {
        this.room = JSON.parse(stringifiedRoom);
        this.username = username;
        this.saveInformationsLocally();
      } else {
        this.getInformationsLocally(roomId);
      }
      this.setMyPokerUser()
    });
  }

  private setMyPokerUser() {
    this.myPokerUser = this.room?.pokerUsers.find(
      (pokerUser) => pokerUser.name === this.username);
  }

  private setUrlToShare() {
    const urlTree = this.router.createUrlTree([],
      { relativeTo: this.activatedRoute, queryParams: { roomId: this.room?.id } });
    this.location.go(urlTree.toString());
  }

  private updateRoomAbroad() {
    this.socket.emit('room updated', this.room);
    this.saveInformationsLocally();
  }

  private saveInformationsLocally() {
    localStorage.setItem('room', JSON.stringify(this.room));
    localStorage.setItem('username', this.username);
  }

  private getInformationsLocally(roomId: string = '') {
    const localStorageRoom = localStorage.getItem('room');
    this.room = localStorageRoom ? JSON.parse(localStorageRoom) : '';
    this.username = localStorage.getItem('username') ?? '';
    if (!this.username) {
      this.getUserIdentification(roomId);
    }
  }

  private getUserIdentification(roomId: string = '') {
    this.router.navigate(['/identification'], { queryParams: { roomId, tool: 'poker' } });
  }

}
