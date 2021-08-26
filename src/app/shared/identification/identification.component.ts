import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from 'src/app/service/utilities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PokerRoom } from 'src/app/interface/poker-room';
import { Socket } from 'ngx-socket-io';
import { NewUserInfo } from 'src/app/interface/new-user-info';
import { PokerUser } from 'src/app/interface/poker-user';
import { BallotRoom } from 'src/app/interface/ballot-room';
import { BallotUser } from 'src/app/interface/ballot-user';
import { RoomService } from 'src/app/service/room.service';

@Component({
  selector: 'app-identification',
  templateUrl: './identification.component.html',
  styleUrls: ['./identification.component.scss']
})
export class IdentificationComponent implements OnInit {

  buttonText: string = '';
  tool: string = '';
  roomId: string = '';
  isBtnDisabled = false;
  identificationForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  constructor(private utilitiesService: UtilitiesService, private roomService: RoomService,
    private router: Router, private activatedRoute: ActivatedRoute, private socket: Socket) { }

  ngOnInit(): void {
    this.setPropertiesFromQueryParams();
    this.setSocketsSubscribers();
  }

  onSubmit() {
    this.isBtnDisabled = true;
    const username: string = this.identificationForm.get('name')?.value;
    if (this.roomId) {
      const newUserInfo: NewUserInfo = { roomId: this.roomId, username };
      this.roomService.joinWSRoom(this.roomId);
      this.socket.emit(`new user enter ${this.tool} room`, newUserInfo);
    } else {
      const room: PokerRoom | BallotRoom = this.buildRoom();
      const queryParams = { stringifiedRoom: JSON.stringify(room), username };
      this.roomService.joinWSRoom(room.id);
      this.router.navigate([`/${this.tool}`], { queryParams });
    }
  }

  private buildRoom(): PokerRoom | BallotRoom {
    const username: string = this.identificationForm.get('name')?.value;
    const userPropertyName = this.tool + 'Users'; 
    const additionalProperties: any = {};
    additionalProperties[userPropertyName] = [{
      name: username,
    }];

    if (this.tool === 'ballot') {
      additionalProperties.options = ['']; 
    }

    const room: PokerRoom | BallotRoom = {
      id: this.utilitiesService.generateRandomString(),
      admin: username,
      ...additionalProperties
    };

    return room;
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
      const updatedRoom: any = room as PokerRoom | BallotRoom;
      const users = updatedRoom[this.tool + 'Users'];
      if (users.find((user: PokerUser | BallotUser) => user.name === username)) {
        const queryParams = { stringifiedRoom: JSON.stringify(updatedRoom), username };
        this.router.navigate([`/${this.tool}`], { queryParams });
      }
    });    
  }

}
