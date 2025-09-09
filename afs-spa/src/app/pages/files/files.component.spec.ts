import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FilesComponent } from './files.component';
import { FileService } from '../../core/services/file.service';
import { FileNode } from '../../core/models/file.model';

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;
  let mockFileService: jasmine.SpyObj<FileService>;

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
    const spy = jasmine.createSpyObj('FileService', ['getFiles']);

    await TestBed.configureTestingModule({
      imports: [FilesComponent, NoopAnimationsModule],
      providers: [
        { provide: FileService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilesComponent);
    component = fixture.componentInstance;
    mockFileService = TestBed.inject(FileService) as jasmine.SpyObj<FileService>;
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
});
