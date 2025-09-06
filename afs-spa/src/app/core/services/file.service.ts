import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { FileNode } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpService) {}

  getFiles(path: string = '/'): Observable<FileNode[]> {
    return this.http.get<FileNode[]>(`/files${path}`);
  }
}
