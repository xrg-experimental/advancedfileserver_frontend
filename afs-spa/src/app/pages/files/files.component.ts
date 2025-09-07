import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
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
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent implements OnInit {
  fileTree: FileNode[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private fileService: FileService) {}

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
    } else {
      // Expand folder - load children if not loaded
      if (folder.children === undefined) {
        folder.expanded = true; // show spinner immediately
        this.updateFlatTree();
        this.loadFolderContents(folder);
      } else {
        folder.expanded = true;
        this.updateFlatTree();
      }
    }
  }

  getFlattenedTree(): FileNode[] {
    const result: FileNode[] = [];

    const flatten = (nodes: FileNode[]) => {
      for (const node of nodes) {
        result.push(node);
        if (node.expanded && node.children) {
          flatten(node.children);
        }
      }
    };

    flatten(this.fileTree);
    return result;
  }

  private loadRootFiles(): void {
    this.isLoading = true;
    this.error = null;

    this.fileService.getFiles('/').subscribe({
      next: (files) => {
        this.fileTree = this.processFiles(files, 0);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading root files:', err);
        this.error = `Failed to load files: ${err.message || 'Unknown error'}`;
        this.isLoading = false;
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
      },
      error: (err) => {
        console.error(`Error loading folder contents for ${folder.path}:`, err);
        folder.loading = false;
        // You might want to show a toast notification here
      }
    });
  }

  private updateFlatTree(): void {
    // This method is called to trigger change detection
    // The template will use getFlattenedTree() to display the tree
  }
}
