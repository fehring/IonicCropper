import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as jsPDF from 'jspdf';
import { File } from '@ionic-native/file/ngx';
import { DocumentScanner, DocumentScannerOptions } from '@ionic-native/document-scanner/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private camera: Camera, private file: File, private documentScanner: DocumentScanner) { }
  myImage = null;
  data64 = null;
  tab: any[] = [];
  croppedImage = null;
  @ViewChild(ImageCropperComponent, { static: false }) angularCropper: ImageCropperComponent;

  captureImage() {
    // this.convertFileToDataURLviaFileReader('assets/cat.jpg').subscribe(
    //   base64 => {
    //     this.myImage = base64;
    //   });
    const options: CameraOptions = {
      quality: 20,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA
    }
    this.camera.getPicture(options).then((imageData) => {
      this.myImage = 'data:image/jpeg;base64,' + imageData;
      this.data64 = imageData;
      this.tab.push(imageData);
    });
  }

  convertFileToDataURLviaFileReader(url: string) {
    return Observable.create(observer => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.onload = () => {
        let reader: FileReader = new FileReader();
        reader.onloadend = () => {
          observer.next(reader.result);
          observer.complete();
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  clear() {
    this.angularCropper.imageBase64 = null;
    this.myImage = null;
    this.croppedImage = null;
  }

  save() {
    this.angularCropper.crop();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  rotateLeft() {
    this.angularCropper.rotateLeft();
  }

  rotateRight() {
    this.angularCropper.rotateRight();
  }
  flipHorizontal() {
    this.angularCropper.flipHorizontal();
  }
  flipVertical() {
    this.angularCropper.flipVertical();
  }
  move(x, y) {
    this.angularCropper.cropper.x1 += x;
    this.angularCropper.cropper.x2 += x;
    this.angularCropper.cropper.y1 += y;
    this.angularCropper.cropper.y2 += y;
  }

  pdf1() {
    // tslint:disable-next-line:max-line-length
    let linkSource = this.data64;

    var image = new Image();
    image.src = 'data:image/png;base64,' + linkSource;
    image.onload = () => {
      const doc = new jsPDF('p', 'pt', [image.naturalWidth, image.naturalHeight]);
      // doc.addImage(linkSource, 'PNG', 0, 0, image.naturalWidth, image.naturalHeight);
      doc.addImage(this.tab[0], 'PNG', 0, 0, image.naturalWidth, image.naturalHeight);


      let pageHeight = doc.internal.pageSize.height;

      // Before adding new content
      let y = image.naturalHeight // Height position of new content
      if (y >= pageHeight) {
        doc.addPage();
        y = 0; // Restart height position
      }
      // doc.addImage(linkSource, 'PNG', 0, y, image.naturalWidth, image.naturalHeight);
      doc.addImage(this.tab[1], 'PNG', 0, y, image.naturalWidth, image.naturalHeight);
      let pdfOutput = doc.output();
      // using ArrayBuffer will allow you to put image inside PDF
      let buffer = new ArrayBuffer(pdfOutput.length);
      let array = new Uint8Array(buffer);
      for (var i = 0; i < pdfOutput.length; i++) {
        array[i] = pdfOutput.charCodeAt(i);
      }

      const directory = this.file.externalApplicationStorageDirectory;
      this.file.writeFile(directory, 'test.pdf', buffer)
      const downloadLink = document.createElement('a');
      const fileName = 'pdfoutput.pdf';
      console.log(doc)
      doc.save('TestPDF');
    };
  }

  scan() {
    const opts: DocumentScannerOptions = { returnBase64: true };
    this.documentScanner.scanDoc(opts)
      .then((res: string) => console.log(res))
      .catch((error: any) => console.error(error));
  }
}
