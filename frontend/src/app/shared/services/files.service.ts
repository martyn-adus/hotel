import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private http = inject(HttpClient);

  // через proxy: /api -> http://localhost:3000
  private readonly uploadUrl = '/api/files/upload';

  uploadImages(files: File[]) {
    const fd = new FormData();
    for (const f of files) {
      fd.append('files', f); // ВАЖЛИВО: саме "files" як у FilesInterceptor('files')
    }
    // бек повертає string[]
    return this.http.post<string[]>(this.uploadUrl, fd);
  }
}
