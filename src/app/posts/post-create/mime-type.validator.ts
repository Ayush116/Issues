// Checking type of file -> here case is of image-type :: .jpeg or .png etc

import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";

export const mimeType = 
    (control: AbstractControl): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => { // as generic type -> <{ [key: string]: any }>
        if (typeof(control.value) === 'string') {
            return of(); // to handle invalid-form-check on click of 'onSavePost()' at EDIT page
        }
        const file = control.value as File;
        const fileReader = new FileReader();
        // fileReader.onloadend = () => {}; // Pre-defined way of the observable
        const frObservable = Observable.create((observer: Observer<{ [key: string]: any }>) => { // creating custom observable
            fileReader.addEventListener("loadend", () => { // equivalent to [fileReader.onloadend=() => {}]
                const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
                let header = "";
                let isValid = false;
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16);
                }
                switch (header) { // case "strings" are patterns(magic numbers) for respective file-types
                    case "89504e47": //.png
                        isValid = true;
                        break;
                    case "ffd8ffDB": //.jpg or .jpeg
                    case "ffd8ffe0":
                    case "ffd8ffe1":
                    case "ffd8ffe2":
                    case "ffd8ffe3":
                    case "ffd8ffe8":
                        isValid = true;
                        break;
                    case "47494638": //.gif
                        isValid = true;
                        break;
                    case "25504446": //.pdf
                    case "504B0304": //.zip
                    default: // any other unknown type
                        isValid = false // Or you can use the bolb.type as fallback
                        break;
                }

                if (isValid) {
                    observer.next(null!);
                } else {
                    observer.next({ invalidMimeType: true });
                }
                observer.complete();
            });
            fileReader.readAsArrayBuffer(file);
        });
        return frObservable;
    };