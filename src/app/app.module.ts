import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PokerModule } from './poker/poker.module';
import { BallotModule } from './ballot/ballot.module';
import { SharedModule } from './shared/shared.module';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

// const config: SocketIoConfig = { url: 'http://127.0.0.1:5000', options: {} };
const config: SocketIoConfig = { url: 'https://marcelodive.pythonanywhere.com', options: {} };

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PokerModule,
    BallotModule,
    SharedModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
