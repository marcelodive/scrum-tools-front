import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BallotComponent } from './ballot/ballot.component';
import { PokerComponent } from './poker/poker.component';
import { IdentificationComponent } from './shared/identification/identification.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'poker', component: PokerComponent },
  { path: 'ballot', component: BallotComponent },
  { path: 'identification', component: IdentificationComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
