import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BallotComponent } from './ballot.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgxSortableModule } from 'ngx-sortable'

@NgModule({
  declarations: [
    BallotComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgxSortableModule
  ],
  exports: [
    BallotComponent
  ]
})
export class BallotModule { }
