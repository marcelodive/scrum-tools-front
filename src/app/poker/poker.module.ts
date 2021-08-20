import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokerComponent } from './poker.component';
import { CardComponent } from './card/card.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [
    PokerComponent,
    CardComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [
    PokerComponent
  ]
})
export class PokerModule { }
