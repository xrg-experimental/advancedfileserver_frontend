import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FileNode, ApiFileListResponse, ApiFileEntry, ListFilesRequest } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private http: HttpService) {}

  getFiles(path: string = '/'): Observable<FileNode[]> {
    const dto: ListFilesRequest = { path };
    return this.http.post<ApiFileListResponse>(`/files/list`, dto)
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
    const normalizeSlashes = (p: string) => (p || '').replace(/\\/g, '/').replace(/\/+/g, '/');
    const stripLeadingSlash = (p: string) => (p || '').replace(/^\/+/, '');
    const ensureLeadingSlash = (p: string) => (p.startsWith('/') ? p : '/' + p);

    const epRaw = entryPath || '';
    const ppRaw = parentPath || '/';

    const ep = normalizeSlashes(epRaw);
    const pp = normalizeSlashes(ppRaw) || '/';

    // If the entry path is absolute after normalization, use it directly
    if (ep.startsWith('/')) {
      return ep;
    }

    const epNoLead = stripLeadingSlash(ep);
    const ppNoLead = stripLeadingSlash(pp);

    // If entry path already starts with parent path, treat it as absolute
    if (epNoLead === ppNoLead || epNoLead.startsWith(ppNoLead + '/')) {
      return ensureLeadingSlash(epNoLead);
    }

    // Construct full path
    if (pp === '/') {
      return ensureLeadingSlash(epNoLead);
    }

    return normalizeSlashes(`${pp}/${epNoLead}`);
  }
}
