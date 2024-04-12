import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Geolocation } from '@capacitor/geolocation';
import { Subject, interval, takeUntil } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonButton, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab1Page implements OnInit {

  start = false;
  unsubscriber = new Subject();
  afs: AngularFirestore = inject(AngularFirestore);
  constructor() { }

  ngOnInit(): void {
    return;
  }

  capture() {
    this.start = !this.start;
    if (this.start) {
      this.startCapture();
    } else {
      this.stopCapture();
    }

  }

  async startCapture() {

    //rxjs interval to get location every 5 seconds and send to server until stop is clicked

    console.log('Start Capture', this.start);
    const counter$ = interval(5000);
    counter$.pipe(takeUntil(this.unsubscriber)).subscribe(async () => {
      console.log('Getting location')
      await this.getLocation();
    });


  }

  async getLocation() {
    const coordinates = await Geolocation.getCurrentPosition();
    await this.afs.doc('locations/1').update({lat: coordinates.coords.latitude, lng: coordinates.coords.longitude});
  }

  stopCapture() {
    console.log('Stop Capture');
    this.unsubscriber.next('');
    this.unsubscriber.complete();

  }
}
