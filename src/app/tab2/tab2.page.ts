import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as mapboxgl from 'mapbox-gl';
import { AfterViewInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { MapBoxService } from '../services/map-box.service';
import { Feature } from 'geojson';
import { GeoJSONSource, GeolocateControl, NavigationControl } from 'mapbox-gl';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonButton, IonFooter, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, HttpClientModule],
  providers: [MapBoxService]
})
export class Tab2Page implements OnInit, AfterViewInit {

  afs: AngularFirestore = inject(AngularFirestore);
  locationObservable: Observable<any>;

  lat: number = 0;
  lng: number = 0;

  officeCoords: [number, number];
  isJourneyStarted: boolean = false;

  map: mapboxgl.Map;
  officeMarker: mapboxgl.Marker;
  myMarker: mapboxgl.Marker;
  style: string = 'mapbox://styles/mapbox/streets-v12';

  @ViewChild('map') mapContainer: ElementRef;
  @ViewChild('office') officeLocationElement: ElementRef;
  @ViewChild('mylocation') myLocationElement: ElementRef;

  mapBoxService: MapBoxService = inject(MapBoxService);
  route: [number, number][] = [];

  constructor() {
    this.officeCoords = [79.56238597334875, 16.8596878930751];
  }

  async ngAfterViewInit(): Promise<void> {

    const location: any = await firstValueFrom(this.afs.doc('locations/1').valueChanges());

    this.map = new mapboxgl.Map({
      accessToken: environment.mapbox.accessToken,
      container: this.mapContainer.nativeElement,
      style: this.style,
      zoom: 20,
      center: [location.lng, location.lat],
    });

    this.map.on('load', () => {

      this.map.resize();
      this.officeMarker = new mapboxgl.Marker({ element: this.officeLocationElement.nativeElement });
      this.officeMarker.setLngLat(this.officeCoords).addTo(this.map);
      this.myMarker = new mapboxgl.Marker({ element: this.myLocationElement.nativeElement });
      this.myMarker.setLngLat([location.lng, location.lat]).addTo(this.map);

      this.map.addControl(new NavigationControl({ showCompass: true, showZoom: true }));
      this.map.addControl(new GeolocateControl({}));

    })

  }

  async ngOnInit(): Promise<void> {

    this.locationObservable = this.afs.doc('locations/1').valueChanges();

    this.locationObservable.subscribe((location: any) => {
      this.lat = location.lat;
      this.lng = location.lng;
    });

  }

  async showRoute(): Promise<void> {

    const query = await firstValueFrom(
      this.mapBoxService.getDirections('mapbox/driving', [[this.lng, this.lat], this.officeCoords],
        { geometries: 'geojson', language: 'en', overview: 'full', steps: true, alternatives: true, annotations: [] }
      ));

    const data = query.routes[0];
    this.route = data.geometry.coordinates;

    if (data.distance <= 50) {
      this.drawCircle(this.officeCoords);
    }

    const geojson: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: this.route
      }
    };

    if (this.map.getSource('route')) {
      (this.map.getSource('route') as GeoJSONSource).setData(geojson);
      return;
    }

    else this.map.addSource('route', {
      type: 'geojson',
      data: geojson
    })

    this.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 10,
        'line-opacity': 0.75
      }
    });

    this.zoomToRoute();
  }

  drawCircle(center: [number, number]) {
    const circleCoordinates = this.calculateCircleCoordinates(center, 10);

    const circlePointsdata: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [circleCoordinates]
      }
    }

    if (this.map.getSource('circle')) {
      (this.map.getSource('circle') as GeoJSONSource).setData(circlePointsdata);
      return;
    }

    else this.map.addSource('circle', {
      type: 'geojson',
      data: circlePointsdata
    });

    this.map.addLayer({
      id: 'circle',
      type: 'fill',
      source: 'circle',
      paint: {
        'fill-color': '#25b0f3',
        'fill-opacity': 0.3,
        'fill-outline-color': '#25b0f3',
      }
    });
  }

  private calculateCircleCoordinates(center: [number, number], radius: number): [number, number][] {

    if (radius < 50) radius = 50;
    const steps = 64;
    const earthRadius = 6378137;
    const radiusInDegrees = radius / earthRadius * (180 / Math.PI);
    const coordinates: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      const lat = center[1] + (radiusInDegrees * Math.sin(theta));
      const lon = center[0] + (radiusInDegrees * Math.cos(theta)) / Math.cos(center[1] * Math.PI / 180);
      coordinates.push([lon, lat]);
    }
    return coordinates;
  }

  startJourney(): void {
    this.isJourneyStarted = !this.isJourneyStarted;
    // let UpdateSource: any;
    let routeSubscription: Subscription;

    if (this.isJourneyStarted) {

      // Subscribe Method
      routeSubscription = this.locationObservable.subscribe((location: any) => {
        this.showRoute().then(() => {
          this.myMarker.setLngLat([location.lng, location.lat]);
        });
      });
      // TimeOut Method
      // UpdateSource = setInterval(() => {
      //   this.showRoute().then(() => {
      //     this.myMarker.setLngLat([this.lng, this.lat]);
      //   });
      // }, 5000);

    }
    else {
      // Subscribe Method
      if (routeSubscription) {
        routeSubscription.unsubscribe();
      }
      if (this.map.getLayer('circle')) this.map.removeLayer('circle');
      if (this.map.getLayer('route')) this.map.removeLayer('route');

      // TimeOut Method
      // clearInterval(UpdateSource);
    }
  }

  zoomToRoute() {
    if (this.route.length === 0) return;
    const bounds = new mapboxgl.LngLatBounds(this.route[0], this.route[0]);
    for (const coord of this.route) bounds.extend(coord);
    this.map.fitBounds(bounds, {
      bearing: this.calculateBearing(this.route),
      animate: true,
      duration: 2000,
      padding: 100,
      easing: (t) => t * (2 - t)
    });
  }

  private calculateBearing(coordinates: [number, number][]): number {
    const [lon1, lat1] = coordinates[0];
    const [lon2, lat2] = coordinates[coordinates.length - 1];

    const radLat1 = lat1 * (Math.PI / 180);
    const radLat2 = lat2 * (Math.PI / 180);
    const deltaLon = (lon2 - lon1) * (Math.PI / 180);

    const y = Math.sin(deltaLon) * Math.cos(radLat2);
    const x = Math.cos(radLat1) * Math.sin(radLat2) -
      Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(deltaLon);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;

    if (bearing < 0) {
      bearing += 360;
    }
    return bearing;
  }
}
