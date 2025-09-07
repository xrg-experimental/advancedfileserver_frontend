import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileNode, ApiFileListResponse, ApiFileEntry } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpService) {}

  getFiles(path: string = '/'): Observable<FileNode[]> {
    return this.http.get<ApiFileListResponse>(`/files/list?path=${encodeURIComponent(path)}`)
      .pipe(
        map(response => this.transformApiResponse(response))
      );
  }

  private transformApiResponse(response: ApiFileListResponse): FileNode[] {
    return response.entries.map(entry => this.transformApiEntry(entry, response.path));
  }

  private transformApiEntry(entry: ApiFileEntry, parentPath: string): FileNode {
    // Construct full path properly
    const fullPath = this.buildFullPath(entry.path, parentPath);
    
    return {
      name: entry.name,
      type: entry.directory ? 'folder' : 'file',
      size: entry.size,
      modified: new Date(entry.modifiedAt),
      path: fullPath,
      children: entry.directory ? [] : undefined,
      expanded: false,
      loading: false,
      level: 0
    };
  }

  private buildFullPath(entryPath: string, parentPath: string): string {
    // If the entry path is absolute, use it directly
    if (entryPath.startsWith('/')) {
      return entryPath;
    }
    
    // Construct the full path from parent and entry
    if (parentPath === '/') {
      return `/${entryPath}`;
    } else {
      return `${parentPath}/${entryPath}`.replace(/\/+/g, '/');
    }
  }
}
