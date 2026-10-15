import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class Photos {
  async prendrePhoto() {
    const photoPrise = await Camera.getPhoto({
      source: CameraSource.Camera,
      quality: 50,
      width: 300, // petite image : elle est stockée telle quelle dans Firebase
      resultType: CameraResultType.DataUrl,
    });
    return photoPrise.dataUrl;
  }
}
