/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  hashUserId,
  generateSalt,
  extractIdeFamily,
  extractPluginFamily,
} from './PrivacyUtils';

describe('PrivacyUtils', () => {
  describe('hashUserId', () => {
    it('should produce consistent hashes for the same input', () => {
      const userId = 12345;
      const salt = 'test-salt-123';

      const hash1 = hashUserId(userId, salt);
      const hash2 = hashUserId(userId, salt);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different user IDs', () => {
      const salt = 'test-salt-123';

      const hash1 = hashUserId(12345, salt);
      const hash2 = hashUserId(67890, salt);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for different salts', () => {
      const userId = 12345;

      const hash1 = hashUserId(userId, 'salt-1');
      const hash2 = hashUserId(userId, 'salt-2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce a 64-character hex string (SHA-256)', () => {
      const hash = hashUserId(12345, 'test-salt');

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should handle edge case user IDs', () => {
      const salt = 'test-salt';

      expect(() => hashUserId(0, salt)).not.toThrow();
      expect(() => hashUserId(-1, salt)).not.toThrow();
      expect(() => hashUserId(Number.MAX_SAFE_INTEGER, salt)).not.toThrow();
    });
  });

  describe('generateSalt', () => {
    it('should generate a 32-character hex string', () => {
      const salt = generateSalt();

      expect(salt).toHaveLength(32);
      expect(salt).toMatch(/^[a-f0-9]+$/);
    });

    it('should generate unique salts on each call', () => {
      const salts = new Set<string>();

      for (let i = 0; i < 100; i++) {
        salts.add(generateSalt());
      }

      // All 100 salts should be unique
      expect(salts.size).toBe(100);
    });
  });

  describe('extractIdeFamily', () => {
    it('should return undefined for undefined input', () => {
      expect(extractIdeFamily(undefined)).toBeUndefined();
    });

    it('should extract vscode family from various identifiers', () => {
      expect(extractIdeFamily('vscode')).toBe('vscode');
      expect(extractIdeFamily('vscode/1.85.0')).toBe('vscode');
      expect(extractIdeFamily('VSCode/1.85.0')).toBe('vscode');
      expect(extractIdeFamily('visual-studio-code')).toBe('vscode');
      expect(extractIdeFamily('Visual-Studio-Code/1.85.0')).toBe('vscode');
    });

    it('should extract intellij family from various JetBrains IDEs', () => {
      expect(extractIdeFamily('intellij-idea')).toBe('intellij');
      expect(extractIdeFamily('intellij-idea/2023.3')).toBe('intellij');
      expect(extractIdeFamily('webstorm')).toBe('intellij');
      expect(extractIdeFamily('pycharm/2023.3')).toBe('intellij');
      expect(extractIdeFamily('phpstorm')).toBe('intellij');
      expect(extractIdeFamily('goland')).toBe('intellij');
      expect(extractIdeFamily('rider')).toBe('intellij');
      expect(extractIdeFamily('clion')).toBe('intellij');
      expect(extractIdeFamily('rubymine')).toBe('intellij');
      expect(extractIdeFamily('datagrip')).toBe('intellij');
      expect(extractIdeFamily('android-studio')).toBe('intellij');
    });

    it('should extract neovim family', () => {
      expect(extractIdeFamily('neovim')).toBe('neovim');
      expect(extractIdeFamily('neovim/0.9.0')).toBe('neovim');
      expect(extractIdeFamily('nvim')).toBe('neovim');
    });

    it('should extract vim family (not neovim)', () => {
      expect(extractIdeFamily('vim')).toBe('vim');
      expect(extractIdeFamily('vim/9.0')).toBe('vim');
    });

    it('should extract other IDE families', () => {
      expect(extractIdeFamily('emacs')).toBe('emacs');
      expect(extractIdeFamily('sublime')).toBe('sublime');
      expect(extractIdeFamily('atom')).toBe('atom');
      expect(extractIdeFamily('xcode')).toBe('xcode');
    });

    it('should return normalized identifier for unknown IDEs', () => {
      expect(extractIdeFamily('unknown-ide/1.0')).toBe('unknown-ide');
      expect(extractIdeFamily('MyCustomIDE')).toBe('mycustomide');
    });
  });

  describe('extractPluginFamily', () => {
    it('should return undefined for undefined input', () => {
      expect(extractPluginFamily(undefined)).toBeUndefined();
    });

    it('should extract plugin family without version', () => {
      expect(extractPluginFamily('copilot-chat')).toBe('copilot-chat');
      expect(extractPluginFamily('copilot-chat/1.0.0')).toBe('copilot-chat');
      expect(extractPluginFamily('copilot-intellij/2.0.0')).toBe(
        'copilot-intellij',
      );
    });

    it('should normalize to lowercase', () => {
      expect(extractPluginFamily('Copilot-Chat/1.0.0')).toBe('copilot-chat');
      expect(extractPluginFamily('COPILOT')).toBe('copilot');
    });
  });
});
