import { Injectable } from '@angular/core';
import { CombatantPreset, SavedLibrary } from '../entities/combatant-preset';
import { LibrarySerializerService } from './library-serializer.service';

const SAVED_LIBRARY_STORAGE_KEY = 'battle-library';

@Injectable({
    providedIn: 'root',
})
export class LibraryStorageService {
    private dirty = false;
    private loadedFileName: string | null = null;

    constructor(private librarySerializer: LibrarySerializerService) {}

    listPresets(): CombatantPreset[] {
        const library = this.loadLibrary();

        return library ? library.presets : [];
    }

    loadLibrary(): SavedLibrary | null {
        const saved = localStorage.getItem(SAVED_LIBRARY_STORAGE_KEY);

        if (!saved) return null;

        try {
            const parsed = JSON.parse(saved) as Partial<SavedLibrary>;

            return {
                id: typeof parsed.id === 'string' && parsed.id ? parsed.id : crypto.randomUUID(),
                ...this.librarySerializer.parseLibraryPayload(parsed, ''),
            };
        } catch {
            localStorage.removeItem(SAVED_LIBRARY_STORAGE_KEY);
            return null;
        }
    }

    savePreset(preset: CombatantPreset): CombatantPreset[] {
        const library = this.loadLibrary();
        const presets = library ? [...library.presets] : [];
        const existingIndex = presets.findIndex((p) => p.id === preset.id);

        if (existingIndex >= 0) {
            presets.splice(existingIndex, 1, preset);
        } else {
            presets.unshift(preset);
        }

        this.persistLibrary({
            id: library?.id ?? crypto.randomUUID(),
            schema: 'dnd-battle.library',
            version: 1,
            name: library?.name ?? '',
            presets,
            savedAt: new Date().toISOString(),
        });

        this.dirty = true;

        return presets;
    }

    deletePreset(id: string): CombatantPreset[] {
        const library = this.loadLibrary();

        if (!library) return [];

        const presets = library.presets.filter((p) => p.id !== id);

        this.persistLibrary({ ...library, presets, savedAt: new Date().toISOString() });
        this.dirty = true;

        return presets;
    }

    persistLibrary(library: SavedLibrary) {
        localStorage.setItem(SAVED_LIBRARY_STORAGE_KEY, JSON.stringify(library));
    }

    isDirty(): boolean {
        return this.dirty;
    }

    markClean() {
        this.dirty = false;
    }

    getLoadedFileName(): string | null {
        return this.loadedFileName;
    }

    setLoadedFileName(name: string | null) {
        this.loadedFileName = name;
    }
}
