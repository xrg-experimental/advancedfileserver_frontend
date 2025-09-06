import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { FileService } from '../../core/services/file.service';
import { FileNode } from '../../core/models/file.model';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  templateUrl: './files.component.html',
  styleUrl: './files.component.scss'
})
export class FilesComponent implements OnInit {
  files: FileNode[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private fileService: FileService) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  private loadFiles(path: string = '/'): void {
    this.isLoading = true;
    this.error = null;

    this.fileService.getFiles(path).subscribe({
      next: (files) => {
        this.files = files;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load files';
        this.isLoading = false;
      }
    });
  }
}
