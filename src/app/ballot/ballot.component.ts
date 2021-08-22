import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket } from 'ngx-socket-io';
import { NewUserInfo } from '../interface/new-user-info';
import { BallotRoom } from '../interface/ballot-room';
import { BallotUser } from '../interface/ballot-user';

@Component({
  selector: 'app-ballot',
  templateUrl: './ballot.component.html',
  styleUrls: ['./ballot.component.scss']
})
export class BallotComponent implements OnInit {

  room: BallotRoom | undefined;
  username: string = '';
  myBallotUser: BallotUser | undefined;
  options: {[n: number]: string} = {};

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private socket: Socket,
    private location: Location) { }

  ngOnInit(): void {
    this.setPropertiesFromQueryParamsOrLocalStorage();
    this.setSocketsSubscribers();
    this.setUrlToShare();
  }

  addOption(index: number, option: string) {
    const options = this.room?.options;
    const isLastOption = (options?.length === (index + 1));
    if (isLastOption && option) {
      options?.push('');
    }
    this.removeInvalidOptions();
    this.updateRoomAbroad();
  }

  updateOption(index:number, option: string) {
    if (this.room?.options?.[index] != null) {
      this.room.options[index] = option; 
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  canStartVoting(): boolean {
    return this.room?.options?.length ? (this.room?.options?.length > 2) : false;
  }

  startVoting() {
    this.removeInvalidOptions(true);

    if (this.room) {
      this.room.startedVoting = true;
      this.room.ballotUsers.forEach((ballotUser) => {
        if (this.room?.options) {
          ballotUser.optionsToSort = [...this.room?.options];
        }
      });
    }
    
    this.updateRoomAbroad();
  }

  listOrderChanged($event: any) {
    console.log($event);
  }

  finishSorting() {
    if (this.myBallotUser) {
      this.myBallotUser.sort = this.myBallotUser?.optionsToSort;
      this.updateRoomAbroad();
    }
  }

  showResults() {
    if (this.room) {
      this.room.finishedVoting = true;
      this.updateRoomAbroad();
    }
  }

  getOrderResults() {
    const ordenationResult: {[s: string]: number} = {};
    this.room?.ballotUsers.forEach((user) => {
      user.sort?.forEach((option, index) => {
        ordenationResult[option] = ordenationResult[option] + index;
      });
    });

    const options = Object.keys(ordenationResult);
    options.sort((optionA, optionB) => {
      return (ordenationResult[optionA] > ordenationResult[optionB]) ? 1 : -1;
    });

    return options.reverse();
  }

  resetVoting() {
    if (this.room) {
      this.room = {
        id: this.room.id,
        admin: this.room.admin,
        ballotUsers: this.room.ballotUsers.map((user) => ({name: user.name})),
        options: ['']
      };
      this.options = [];
    };
    this.updateRoomAbroad();
  }

  isAdmin() {
    return (this.room?.admin === this.myBallotUser?.name);
  }

  private removeInvalidOptions(removeLast: boolean = false) {
    if (this.room?.options) {
      this.room.options = this.room?.options?.filter((option, index) => {
        return removeLast 
        ? option && (option != '') 
        : (option && (option != '') || ((index + 1) === this.room?.options?.length));
      });
    }
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
      this.setMyBallotUser();
      this.setInputValues();
    });
  }

  private setInputValues() {
    this.options = this.room?.options || [''];
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
    this.router.navigate(['/identification'], { queryParams: { roomId, tool: 'ballot' } });
  }

  private setSocketsSubscribers() {
    this.socket.fromEvent('room updated').subscribe((room) => {
      this.room = room as BallotRoom;
      this.setMyBallotUser();
    });

    this.socket.fromEvent('new user enter ballot room').subscribe((newUserInfo) => {
      const userInfo: NewUserInfo = newUserInfo as NewUserInfo;
      const ballotUser: BallotUser = { name: userInfo?.username };
      this.room?.ballotUsers?.push(ballotUser);
      this.updateRoomAbroad();
    });

    // setInterval(() => this.isAdmin() && this.updateRoomAbroad(), 5000)
  }

  private updateRoomAbroad() {
    if (this.room) {
      console.log('updating room abroad');
      this.socket.emit('room updated', this.room);
      this.saveInformationsLocally();
    }
  }

  private setMyBallotUser() {
    if (this.room) {
      this.myBallotUser = this.room?.ballotUsers.find(
        (ballotUser) => ballotUser.name === this.username);
    }
  }

  private setUrlToShare() {
    const urlTree = this.router.createUrlTree([],
      { relativeTo: this.activatedRoute, queryParams: { roomId: this.room?.id } });
    this.location.go(urlTree.toString());
  }

}
