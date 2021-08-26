import { HostListener, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { BallotRoom } from '../interface/ballot-room';
import { PokerRoom } from '../interface/poker-room';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private socket: Socket) { }

  joinWSRoom(roomId: string = '') {
    this.socket.emit(`join room`, roomId);
  }
  
  leftWSRoom(roomId:string = '', username:string = '') {
    this.socket.emit('left room', { roomId, username });
  }

  getShareLink(roomId:string = '') {
    const tool = location.hash.includes('poker') ? 'poker' : 'ballot';
    return location.origin + location.pathname + '#/' + tool + '?roomId=' + roomId;
  }

  removeUserFromRoom(room: any, tool: string, username: string) {
    const userPropertyName = `${tool}Users`;
    let users = room?.[userPropertyName];
    if (users) {
      users = users.filter((user: any) => user.name !== username);
    }
  }

}
