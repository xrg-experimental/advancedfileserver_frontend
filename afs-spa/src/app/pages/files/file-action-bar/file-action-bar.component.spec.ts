import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FileActionBarComponent } from './file-action-bar.component';
import { FileNode, FilePermissions } from '../../../core/models/file.model';

describe('FileActionBarComponent', () => {
  let component: FileActionBarComponent;
  let fixture: ComponentFixture<FileActionBarComponent>;

  const mockFilePermissions: FilePermissions = {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canShare: true,
    canUpload: true
  };

  const mockFileNode: FileNode = {
    name: 'test-file.txt',
    type: 'file',
    path: '/test-file.txt',
    size: 1024,
    modified: new Date()
  };

  const mockFolderNode: FileNode = {
    name: 'test-folder',
    type: 'folder',
    path: '/test-folder'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileActionBarComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FileActionBarComponent);
    component = fixture.componentInstance;
    component.permissions = mockFilePermissions;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Action States - No Selection', () => {
    beforeEach(() => {
      component.selectedItem = null;
      component.ngOnChanges({
        selectedItem: {
          currentValue: null,
          previousValue: undefined,
          firstChange: true,
          isFirstChange: () => true
        }
      });
      fixture.detectChanges();
    });

    it('should enable upload and create directory actions when no item is selected', () => {
      const uploadAction = component.actions.find(a => a.id === 'upload');
      const createDirAction = component.actions.find(a => a.id === 'create-directory');
      
      expect(uploadAction?.enabled).toBe(true);
      expect(createDirAction?.enabled).toBe(true);
    });

    it('should disable download, rename, move, and delete actions when no item is selected', () => {
      const downloadAction = component.actions.find(a => a.id === 'download');
      const renameAction = component.actions.find(a => a.id === 'rename');
      const moveAction = component.actions.find(a => a.id === 'move');
      const deleteAction = component.actions.find(a => a.id === 'delete');
      
      expect(downloadAction?.enabled).toBe(false);
      expect(renameAction?.enabled).toBe(false);
      expect(moveAction?.enabled).toBe(false);
      expect(deleteAction?.enabled).toBe(false);
    });
  });

  describe('Action States - File Selected', () => {
    beforeEach(() => {
      component.selectedItem = mockFileNode;
      component.ngOnChanges({
        selectedItem: {
          currentValue: mockFileNode,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      });
      fixture.detectChanges();
    });

    it('should enable download, rename, move, and delete actions when file is selected', () => {
      const downloadAction = component.actions.find(a => a.id === 'download');
      const renameAction = component.actions.find(a => a.id === 'rename');
      const moveAction = component.actions.find(a => a.id === 'move');
      const deleteAction = component.actions.find(a => a.id === 'delete');
      
      expect(downloadAction?.enabled).toBe(true);
      expect(renameAction?.enabled).toBe(true);
      expect(moveAction?.enabled).toBe(true);
      expect(deleteAction?.enabled).toBe(true);
    });

    it('should disable upload action when file is selected', () => {
      const uploadAction = component.actions.find(a => a.id === 'upload');
      expect(uploadAction?.enabled).toBe(false);
    });
  });

  describe('Action States - Folder Selected', () => {
    beforeEach(() => {
      component.selectedItem = mockFolderNode;
      component.ngOnChanges({
        selectedItem: {
          currentValue: mockFolderNode,
          previousValue: null,
          firstChange: false,
          isFirstChange: () => false
        }
      });
      fixture.detectChanges();
    });

    it('should enable upload, rename, move, and delete actions when folder is selected', () => {
      const uploadAction = component.actions.find(a => a.id === 'upload');
      const renameAction = component.actions.find(a => a.id === 'rename');
      const moveAction = component.actions.find(a => a.id === 'move');
      const deleteAction = component.actions.find(a => a.id === 'delete');
      
      expect(uploadAction?.enabled).toBe(true);
      expect(renameAction?.enabled).toBe(true);
      expect(moveAction?.enabled).toBe(true);
      expect(deleteAction?.enabled).toBe(true);
    });

    it('should disable download action when folder is selected', () => {
      const downloadAction = component.actions.find(a => a.id === 'download');
      expect(downloadAction?.enabled).toBe(false);
    });
  });

  describe('Permission-based Action States', () => {
    it('should disable actions when user lacks required permissions', () => {
      const restrictedPermissions: FilePermissions = {
        canRead: false,
        canWrite: false,
        canDelete: false,
        canShare: false,
        canUpload: false
      };

      component.permissions = restrictedPermissions;
      component.selectedItem = mockFileNode;
      component.ngOnChanges({
        permissions: {
          currentValue: restrictedPermissions,
          previousValue: mockFilePermissions,
          firstChange: false,
          isFirstChange: () => false
        }
      });
      fixture.detectChanges();

      const allActions = component.actions;
      allActions.forEach(action => {
        expect(action.enabled).toBe(false);
      });
    });

    it('should disable only delete action when user lacks delete permission', () => {
      const limitedPermissions: FilePermissions = {
        canRead: true,
        canWrite: true,
        canDelete: false,
        canShare: true,
        canUpload: true
      };

      component.permissions = limitedPermissions;
      component.selectedItem = mockFileNode;
      component.ngOnChanges({
        permissions: {
          currentValue: limitedPermissions,
          previousValue: mockFilePermissions,
          firstChange: false,
          isFirstChange: () => false
        }
      });
      fixture.detectChanges();

      const deleteAction = component.actions.find(a => a.id === 'delete');
      const downloadAction = component.actions.find(a => a.id === 'download');
      const renameAction = component.actions.find(a => a.id === 'rename');
      
      expect(deleteAction?.enabled).toBe(false);
      expect(downloadAction?.enabled).toBe(true);
      expect(renameAction?.enabled).toBe(true);
    });
  });

  describe('Action Events', () => {
    it('should emit uploadFile event when upload action is clicked', () => {
      spyOn(component.uploadFile, 'emit');
      component.onActionClick('upload');
      expect(component.uploadFile.emit).toHaveBeenCalled();
    });

    it('should emit downloadFile event when download action is clicked', () => {
      spyOn(component.downloadFile, 'emit');
      component.onActionClick('download');
      expect(component.downloadFile.emit).toHaveBeenCalled();
    });

    it('should emit renameItem event when rename action is clicked', () => {
      spyOn(component.renameItem, 'emit');
      component.onActionClick('rename');
      expect(component.renameItem.emit).toHaveBeenCalled();
    });

    it('should emit moveItem event when move action is clicked', () => {
      spyOn(component.moveItem, 'emit');
      component.onActionClick('move');
      expect(component.moveItem.emit).toHaveBeenCalled();
    });

    it('should emit deleteItem event when delete action is clicked', () => {
      spyOn(component.deleteItem, 'emit');
      component.onActionClick('delete');
      expect(component.deleteItem.emit).toHaveBeenCalled();
    });

    it('should emit createDirectory event when create directory action is clicked', () => {
      spyOn(component.createDirectory, 'emit');
      component.onActionClick('create-directory');
      expect(component.createDirectory.emit).toHaveBeenCalled();
    });
  });
});