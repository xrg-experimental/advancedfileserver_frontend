import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FilesComponent } from './files.component';
import { FileService } from '../../core/services/file.service';
import { FileOperationService } from '../../core/services/file-operation.service';
import { FileNode } from '../../core/models/file.model';

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;
  let mockFileService: jasmine.SpyObj<FileService>;
  let mockFileOperationService: jasmine.SpyObj<FileOperationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockFiles: FileNode[] = [
    {
      name: 'folder1',
      type: 'folder',
      path: '/folder1',
      modified: new Date('2023-01-01')
    },
    {
      name: 'file1.txt',
      type: 'file',
      path: '/file1.txt',
      size: 1024,
      modified: new Date('2023-01-02')
    }
  ];

  beforeEach(async () => {
    const fileServiceSpy = jasmine.createSpyObj('FileService', ['getFiles']);
    const fileOperationServiceSpy = jasmine.createSpyObj('FileOperationService', [
      'renameItem', 'moveItem', 'deleteItem', 'createDirectory'
    ]);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [FilesComponent, NoopAnimationsModule],
      providers: [
        { provide: FileService, useValue: fileServiceSpy },
        { provide: FileOperationService, useValue: fileOperationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilesComponent);
    component = fixture.componentInstance;
    mockFileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
    mockFileOperationService = TestBed.inject(FileOperationService) as jasmine.SpyObj<FileOperationService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  it('should create', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with root path', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    expect(component.currentPath).toBe('/');
    expect(mockFileService.getFiles).toHaveBeenCalledWith('/');
  });

  it('should generate breadcrumbs correctly', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    component.navigateToPath('/folder1/subfolder');
    
    expect(component.breadcrumbs).toEqual([
      { name: 'Root', path: '/' },
      { name: 'folder1', path: '/folder1' },
      { name: 'subfolder', path: '/folder1/subfolder' }
    ]);
  });

  it('should handle single selection correctly', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const file = component.fileList[0];
    component.selectItem(file);
    
    expect(component.selectedItem).toBe(file);
    expect(file.selected).toBe(true);
  });

  it('should deselect when clicking same item', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const file = component.fileList[0];
    component.selectItem(file);
    component.selectItem(file);
    
    expect(component.selectedItem).toBeNull();
    expect(file.selected).toBe(false);
  });

  it('should navigate to folder on double click', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const folder = component.fileList.find(f => f.type === 'folder')!;
    spyOn(component, 'navigateToPath');
    
    component.onItemDoubleClick(folder);
    
    expect(component.navigateToPath).toHaveBeenCalledWith(folder.path);
  });

  it('should not navigate on double click for files', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const file = component.fileList.find(f => f.type === 'file')!;
    spyOn(component, 'navigateToPath');
    
    component.onItemDoubleClick(file);
    
    expect(component.navigateToPath).not.toHaveBeenCalled();
  });

  it('should handle navigation up correctly', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    component.currentPath = '/folder1/subfolder';
    
    component.navigateUp();
    
    expect(mockFileService.getFiles).toHaveBeenCalledWith('/folder1');
  });

  it('should not navigate up from root', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    component.currentPath = '/';
    
    expect(component.canNavigateUp()).toBe(false);
  });

  it('should handle loading errors', () => {
    mockFileService.getFiles.and.returnValue(throwError(() => new Error('Network error')));
    fixture.detectChanges();
    
    expect(component.error).toContain('Failed to load directory');
    expect(component.isLoading).toBe(false);
  });

  it('should reset selection when navigating', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const file = component.fileList[0];
    component.selectItem(file);
    
    component.navigateToPath('/other-path');
    
    expect(component.selectedItem).toBeNull();
  });

  it('should open rename dialog when rename action is triggered', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const file = component.fileList[0];
    component.selectItem(file);
    
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(undefined));
    mockDialog.open.and.returnValue(mockDialogRef);
    
    component.onRenameItem();
    
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open delete confirmation dialog when delete action is triggered', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const file = component.fileList[0];
    component.selectItem(file);
    
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(false));
    mockDialog.open.and.returnValue(mockDialogRef);
    
    component.onDeleteItem();
    
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open create directory dialog when create directory action is triggered', () => {
    mockFileService.getFiles.and.returnValue(of(mockFiles));
    fixture.detectChanges();
    
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialogRef.afterClosed.and.returnValue(of(undefined));
    mockDialog.open.and.returnValue(mockDialogRef);
    
    component.onCreateDirectory();
    
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
