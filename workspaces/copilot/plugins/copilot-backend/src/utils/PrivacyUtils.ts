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

import { createHash, randomBytes } from 'crypto';

/**
 * One-way hash function for user IDs to preserve privacy while allowing
 * longitudinal tracking. Uses SHA-256 with a salt.
 *
 * @param userId - The numeric user ID from GitHub
 * @param salt - Instance-specific salt (should be generated once and stored)
 * @returns A 64-character hex string (SHA-256 hash)
 */
export function hashUserId(userId: number, salt: string): string {
  return createHash('sha256').update(`${userId}:${salt}`).digest('hex');
}

/**
 * Generates a cryptographically secure salt for hashing.
 * This should be generated once per Backstage instance and stored securely.
 *
 * @returns A 32-character hex string suitable for use as a salt
 */
export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Extracts the IDE family from a full IDE version string.
 * Per spec, we only store the IDE family, not the version.
 *
 * @param ideIdentifier - Full IDE identifier (e.g., 'vscode/1.85.0', 'intellij-idea/2023.3')
 * @returns IDE family only (e.g., 'vscode', 'intellij')
 */
export function extractIdeFamily(ideIdentifier?: string): string | undefined {
  if (!ideIdentifier) {
    return undefined;
  }

  // Common patterns: 'vscode', 'vscode/1.85.0', 'intellij-idea/2023.3'
  const normalized = ideIdentifier.toLowerCase();

  // Remove version if present
  const withoutVersion = normalized.split('/')[0];

  // Map common IDE identifiers to families
  if (
    withoutVersion.includes('vscode') ||
    withoutVersion.includes('visual-studio-code')
  ) {
    return 'vscode';
  }
  if (
    withoutVersion.includes('intellij') ||
    withoutVersion.includes('idea') ||
    withoutVersion.includes('webstorm') ||
    withoutVersion.includes('pycharm') ||
    withoutVersion.includes('phpstorm') ||
    withoutVersion.includes('goland') ||
    withoutVersion.includes('rider') ||
    withoutVersion.includes('clion') ||
    withoutVersion.includes('rubymine') ||
    withoutVersion.includes('datagrip') ||
    withoutVersion.includes('android-studio')
  ) {
    return 'intellij';
  }
  if (withoutVersion.includes('neovim') || withoutVersion.includes('nvim')) {
    return 'neovim';
  }
  if (withoutVersion.includes('vim')) {
    return 'vim';
  }
  if (withoutVersion.includes('emacs')) {
    return 'emacs';
  }
  if (withoutVersion.includes('sublime')) {
    return 'sublime';
  }
  if (withoutVersion.includes('atom')) {
    return 'atom';
  }
  if (withoutVersion.includes('xcode')) {
    return 'xcode';
  }

  // Return the base identifier if we don't recognize it
  return withoutVersion;
}

/**
 * Extracts the plugin family from a full plugin identifier.
 * Per spec, we only store the plugin family, not the version.
 *
 * @param pluginIdentifier - Full plugin identifier (e.g., 'copilot-chat/1.0.0')
 * @returns Plugin family only (e.g., 'copilot-chat')
 */
export function extractPluginFamily(
  pluginIdentifier?: string,
): string | undefined {
  if (!pluginIdentifier) {
    return undefined;
  }

  // Remove version if present
  return pluginIdentifier.toLowerCase().split('/')[0];
}
