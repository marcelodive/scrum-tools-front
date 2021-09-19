import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokerRoom } from '../interface/poker-room';
import { Socket } from 'ngx-socket-io';
import { PokerUser } from '../interface/poker-user';
import { NewUserInfo } from '../interface/new-user-info';
import { UtilitiesService } from '../service/utilities.service';
import { RoomService } from '../service/room.service';

@Component({
  selector: 'app-poker',
  templateUrl: './poker.component.html',
  styleUrls: ['./poker.component.scss']
})
export class PokerComponent implements OnInit {

  room: PokerRoom | undefined;
  myPokerUser: PokerUser | undefined;
  username: string = '';
  selectedCard: number = 0;
  cardNumbers: number[] = [1, 2, 3, 5, 8, 13];

  constructor(private activatedRoute: ActivatedRoute, private router: Router, public roomService: RoomService,
    private location: Location, private socket: Socket, public utilitiesService: UtilitiesService) { }

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

    return votes.length ? this.utilitiesService.getMode(validVotes as number[]) : 0;
  }

  updateUserVote(cardNumber: number) {
    if (this.myPokerUser) {
      this.myPokerUser.vote = cardNumber;
      this.updateUserAbroad();
    }
  }

  showResults() {
    if (this.room) {
      this.room.finishedVoting = true;
      this.updateRoomAbroad();
    }
  }

  getVotePercentage() {
    const countPokerUsers = this.room?.pokerUsers?.length || 1;
    const countPokersUsersWhoVoted: number = this.room?.pokerUsers?.filter(
      (pokerUser) => pokerUser.vote)?.length || 0;
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

  isAdmin() {
    return (this.room?.admin === this.username);
  }

  private setSocketsSubscribers() {
    this.socket.fromEvent('room updated').subscribe((room) => {
      this.room = room as PokerRoom;
      this.setMyPokerUser();
    });

    this.socket.fromEvent('new user enter poker room').subscribe((newUserInfo) => {
        const userInfo: NewUserInfo = newUserInfo as NewUserInfo;
        const pokerUser: PokerUser = { name: userInfo?.username };
        this.room?.pokerUsers?.push(pokerUser);
        if (this.isAdmin()) {
          this.socket.emit('update room for new user', this.room);
        }
    });

    this.socket.fromEvent('user updated').subscribe((updatedUser) => {
      const updatedPokerUser: PokerUser = updatedUser as PokerUser;
      const userFromRoom = this.room?.pokerUsers.find((user: PokerUser) => updatedPokerUser?.name == user?.name);
      if (userFromRoom) {
        userFromRoom.vote = updatedPokerUser.vote;
      }
    });

    this.socket.fromEvent('user left the room').subscribe((username) => {
      this.roomService.removeUserFromRoom(this.room, 'poker', username as string);
    })
  }

  private setPropertiesFromQueryParamsOrLocalStorage() {
    this.activatedRoute.queryParams.subscribe(({ stringifiedRoom, username, roomId }) => {
      if (stringifiedRoom) {
        this.room = JSON.parse(stringifiedRoom);
        this.username = username;
        this.saveInformationsLocally();
        this.roomService.joinWSRoom(this.room?.id || '');
      } else {
        this.getInformationsLocally(roomId);
        this.roomService.joinWSRoom(roomId);
      }
      this.setMyPokerUser()
    });
  }

  private setMyPokerUser() {
    this.myPokerUser = this.room?.pokerUsers?.find(
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

  private updateUserAbroad() {
    this.socket.emit('user updated', {...this.myPokerUser, roomId: this.room?.id});
    this.saveInformationsLocally();
  }

  private saveInformationsLocally() {
    sessionStorage.setItem('room' + this.room?.id, JSON.stringify(this.room));
    sessionStorage.setItem('username' + this.room?.id, this.username);
  }

  private getInformationsLocally(roomId: string = '') {
    const localStorageRoom = sessionStorage.getItem('room' + roomId);
    this.room = localStorageRoom ? JSON.parse(localStorageRoom) : '';
    this.username = sessionStorage.getItem('username' + roomId) ?? '';
    if (!this.username) {
      this.getUserIdentification(roomId);
    }
  }

  private getUserIdentification(roomId: string = '') {
    this.router.navigate(['/identification'], { queryParams: { roomId, tool: 'poker' } });
  }

}
