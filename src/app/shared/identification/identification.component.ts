import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'src/app/service/utilities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from 'src/app/interface/room';
import { Socket } from 'ngx-socket-io';
import { NewUserInfo } from 'src/app/interface/new-user-info';
import { PokerUser } from 'src/app/interface/poker-user';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss']
})
export class IdentificationComponent implements OnInit {

  buttonText: string = '';
  tool: string = '';
  roomId: string = '';
  identificationForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(private utilitiesService: UtilitiesService,
    private router: Router, private activatedRoute: ActivatedRoute, private socket: Socket) { }

  ngOnInit(): void {
    this.setPropertiesFromQueryParams();
    this.setSocketsSubscribers();
  }

  onSubmit() {    
    const username: string = this.identificationForm.get('name')?.value;
    if (this.roomId) {
      const newUserInfo: NewUserInfo = { roomId: this.roomId, username };
      this.socket.emit(`new user enter ${this.tool} room`, newUserInfo);
      this.joinWSRoom(this.roomId);
    } else {
      const room: Room = this.buildRoom();
      const queryParams = { stringifiedRoom: JSON.stringify(room), username };
      this.joinWSRoom(room.id);
      this.router.navigate([`/${this.tool}`], { queryParams });
    }
  }

  private joinWSRoom(roomId: string) {
    this.socket.emit(`join room`, roomId);
  }

  private buildRoom(): Room {
    const username: string = this.identificationForm.get('name')?.value;

    return {
      id: this.utilitiesService.generateRandomString(),
      admin: username,
      pokerUsers: [{
        name: username,
      }]
    };
  }

  private setPropertiesFromQueryParams() {
    this.activatedRoute.queryParams.subscribe(({ tool, roomId }) => {
      this.tool = tool;
      this.roomId = roomId;
      this.buttonText = this.roomId
        ? `Enter ${this.tool} room (${this.roomId})`
        : `Create ${this.tool} room`;
    });
  }
  
  private setSocketsSubscribers() {
    this.socket.fromEvent('room updated').subscribe((room) => {
      const username: string = this.identificationForm.get('name')?.value;
      const updatedRoom: Room = room as Room;
      if (updatedRoom.pokerUsers.find((pokerUser: PokerUser) => pokerUser.name === username)) {
        const queryParams = { stringifiedRoom: JSON.stringify(updatedRoom), username };
        this.router.navigate([`/${this.tool}`], { queryParams });
      }
    });    
  }

}
