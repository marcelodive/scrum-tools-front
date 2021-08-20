import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BallotComponent } from './ballot.component';



@NgModule({
  declarations: [
    BallotComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    BallotComponent
  ]
})
export class BallotModule { }
