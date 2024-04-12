import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent]
})
export class Tab2Page implements OnInit {

  afs: AngularFirestore = inject(AngularFirestore);

  lat: number = 0;
  lng: number =0;

  constructor() {
  }

  ngOnInit(): void {
    this.afs.doc('locations/1').valueChanges().subscribe((location: any) => {
      this.lat = location.lat;
      this.lng = location.lng;
    });
  }

}
