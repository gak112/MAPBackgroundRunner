import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapBoxService {

  private readonly directionUrl: string = 'https://api.mapbox.com/directions/v5';
  private readonly matrixUrl: string = 'https://api.mapbox.com/directions-matrix/v1';

  http: HttpClient = inject(HttpClient);

  constructor() { }

  getDirections(
    profile: 'mapbox/driving-traffic' | 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling',
    coordinates: [number, number][],
    options?: {
      alternatives?: boolean,
      annotations?: string[],
      geometries?: 'geojson' | 'polyline' | 'polyline6',
      steps?: boolean,
      language?: 'en',
      overview?: 'full' | 'simplified' | 'false'
    }
  ): Observable<any> {

    const coordinatesParam = encodeURIComponent(this.createcoordParam(coordinates));

    let params = new HttpParams()
      .set('alternatives', options?.alternatives ? 'true' : 'false' || 'false')
      .set('geometries', options?.geometries || 'geojson')
      .set('steps', options?.steps ? 'true' : 'false' || 'false')
      .set('language', options?.language || 'en')
      .set('overview', options?.overview || 'full')
      .set('access_token', environment.mapbox.accessToken);

    if (options?.annotations) params.set('annotations', this.createAnnotations(options.annotations));

    const url = `${this.directionUrl}/${profile}/${coordinatesParam}`;

    return this.http.get<any>(url, { params: params });
  }

  getMatrix(
    profile: 'mapbox/driving' | 'mapbox/walking' | 'mapbox/cycling' | 'mapbox/driving-traffic',
    coordinates: [number, number][],
    options?: {
      annotations?: string[],
      approaches?: string,
      bearings?: string,
      destinations?: string | number,
      sources?: string | number,
      fallback_speed?: number,
      depart_at?: string,
    }
  ): Observable<any> {

    const params = new HttpParams()
      .set('access_token', environment.mapbox.accessToken);

    if (options?.annotations) {
      params.set('annotations', this.createAnnotations(options.annotations));
    }
    if (options?.approaches) {
      params.set('approaches', options.approaches);
    }
    if (options?.bearings) {
      params.set('bearings', options.bearings);
    }
    if (options?.destinations) {
      params.set('destinations', options.destinations);
    }
    if (options?.sources) {
      params.set('sources', options.sources);
    }
    if (options?.depart_at) {
      params.set('depart_at', options.depart_at);
    }

    const url = `${this.matrixUrl}/${profile}/${this.createcoordParam(coordinates)}`;

    return this.http.get(url, { params });

  }

  createcoordParam(coords: [number, number][]): string {
    const result = coords.map(pair => pair.join(',')).join(';');
    return result;
  }

  createAnnotations(annotations: string[]): string {
    return annotations.join(',');
  }

}
