import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatButtonModule } from '@angular/material/button';
import { FileService } from '../../core/services/file.service';
import { FileNode } from '../../core/models/file.model';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesComponent implements OnInit {
  fileTree: FileNode[] = [];
  flatTree: FileNode[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private fileService: FileService, private cdr: ChangeDetectorRef) {}

  trackByPath = (_: number, item: { path: string }) => item.path;

  ngOnInit(): void {
    this.loadRootFiles();
  }

  toggleFolder(folder: FileNode): void {
    if (folder.type !== 'folder') {
      return;
    }

    if (folder.loading) {
      // Avoid duplicate in-flight requests
      return;
    }

    if (folder.expanded) {
      // Collapse folder
      folder.expanded = false;
      this.updateFlatTree();
      this.cdr.markForCheck();
    } else {
      // Expand folder - load children if not loaded
      if (folder.children === undefined) {
        folder.expanded = true; // show spinner immediately
        this.updateFlatTree();
        this.cdr.markForCheck();
        this.loadFolderContents(folder);
      } else {
        folder.expanded = true;
        this.updateFlatTree();
        this.cdr.markForCheck();
      }
    }
  }

  private loadRootFiles(): void {
    this.isLoading = true;
    this.error = null;

    this.fileService.getFiles('/').subscribe({
      next: (files) => {
        this.fileTree = this.processFiles(files, 0);
        this.isLoading = false;
        this.updateFlatTree();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading root files:', err);
        this.error = `Failed to load files: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private processFiles(files: FileNode[], level: number): FileNode[] {
    return files.map(file => {
      const node: FileNode = {
        ...file,
        level,
        expanded: false,
        loading: false
      };
      // children === undefined => not yet loaded; [] => loaded but empty
      if (file.type === 'folder') node.children = undefined;
      return node;
    });
  }

  private loadFolderContents(folder: FileNode): void {
    folder.loading = true;

    this.fileService.getFiles(folder.path).subscribe({
      next: (files) => {
        folder.children = this.processFiles(files, (folder.level || 0) + 1);
        folder.loading = false;
        this.updateFlatTree();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(`Error loading folder contents for ${folder.path}:`, err);
        folder.loading = false;
        // You might want to show a toast notification here
        this.updateFlatTree();
        this.cdr.markForCheck();
      }
    });
  }

  private updateFlatTree(): void {
    const out: FileNode[] = [];
    const flatten = (nodes: FileNode[]) => {
      for (const n of nodes) {
        out.push(n);
        if (n.expanded && n.children) flatten(n.children);
      }
    };
    flatten(this.fileTree);
    this.flatTree = out;
  }
}
