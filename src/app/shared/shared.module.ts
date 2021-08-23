import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentificationComponent } from './identification/identification.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ScrumToolsComponent } from './scrum-tools/scrum-tools.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    IdentificationComponent,
    PageNotFoundComponent,
    ScrumToolsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    RouterModule
  ],
  exports: [
    IdentificationComponent,
    PageNotFoundComponent,
    FlexLayoutModule
  ]
})
export class SharedModule { }
