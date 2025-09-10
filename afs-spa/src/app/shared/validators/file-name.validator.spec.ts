import { getNameValidationError, isValidName, nameValidator } from './file-name.validator';

describe('file-name.validator', () => {
  describe('basic validation', () => {
    it('should invalidate empty names with default label', () => {
      expect(isValidName('')).toBeFalse();
      expect(getNameValidationError('')).toBe('Name cannot be empty');
    });

    it('should invalidate invalid characters', () => {
      const invalids = ['invali<d', 'invali>d', 'in:valid', 'in"valid', 'in/valid', 'in\\valid', 'in|valid', 'in?valid', 'in*valid'];
      for (const v of invalids) {
        expect(isValidName(v)).toBeFalse();
        expect(getNameValidationError(v)).toBe('Name contains invalid characters: < > : " / \\ | ? *');
      }
    });

    it('should invalidate reserved Windows names', () => {
      const reserved = ['CON', 'prn', 'AuX', 'nul', 'COM1', 'LPT9'];
      for (const r of reserved) {
        const res = nameValidator(r);
        expect(res.valid).toBeFalse();
        expect(res.error).toBe('This name is reserved by the system');
      }
    });

    it('should allow normal names', () => {
      const names = ['file.txt', 'Folder', 'my_file', 'data-01'];
      for (const n of names) {
        expect(isValidName(n)).toBeTrue();
        expect(getNameValidationError(n)).toBe('');
      }
    });
  });

  describe('dots-only option', () => {
    it('should invalidate dots-only when forbidDotsOnly = true and use provided label', () => {
      const opts = { label: 'Folder name', forbidDotsOnly: true } as const;
      expect(isValidName('.', opts)).toBeFalse();
      expect(isValidName('..', opts)).toBeFalse();
      expect(getNameValidationError('...', opts)).toBe('Folder name cannot be only dots');
    });

    it('should allow dots-only when forbidDotsOnly = false (default)', () => {
      // Provided it passes other checks, dots-only is considered valid by base rules
      expect(isValidName('.')).toBeTrue();
      expect(getNameValidationError('.')).toBe('');
    });
  });

  describe('custom label', () => {
    it('should use custom label in empty message', () => {
      const opts = { label: 'Folder name' } as const;
      expect(getNameValidationError('   ', opts)).toBe('Folder name cannot be empty');
    });
  });
});
