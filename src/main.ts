import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AngularFireModule } from "@angular/fire/compat";
if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes), 
    importProvidersFrom(
  
        AngularFireModule.initializeApp({"projectId":"grasis-8dffb","appId":"1:99184450454:web:cf270e85facc2d1a989bb7","storageBucket":"grasis-8dffb.appspot.com","apiKey":"AIzaSyAuqRSeTX4ap77WaQQkoFbGRgt-PbH2HWQ","authDomain":"grasis-8dffb.firebaseapp.com","messagingSenderId":"99184450454","measurementId":"G-WCLS4W69BY"})
        
        
     ),
  ],
});
