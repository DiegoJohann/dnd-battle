import { Injectable } from '@angular/core';
import { EncounterData, EncounterSerializerService } from './encounter-serializer.service';

export interface SavedEncounter extends EncounterData {
    id: string;
}

const SAVED_ENCOUNTERS_STORAGE_KEY = 'battle-encounters';

@Injectable({
    providedIn: 'root'
})
export class EncounterStorageService {
    constructor(private encounterSerializer: EncounterSerializerService) {
    }

    listEncounters(defaultName: string): SavedEncounter[] {
        const saved = localStorage.getItem(SAVED_ENCOUNTERS_STORAGE_KEY);

        if (!saved) return [];

        try {
            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) return [];

            return parsed.map((entry) => {
                const savedEncounter = entry as Partial<SavedEncounter>;
                const encounter = this.encounterSerializer.parseEncounterPayload(savedEncounter, defaultName);

                return {
                    id: typeof savedEncounter.id === 'string' && savedEncounter.id
                        ? savedEncounter.id
                        : crypto.randomUUID(),
                    ...encounter
                };
            });
        } catch {
            localStorage.removeItem(SAVED_ENCOUNTERS_STORAGE_KEY);
            return [];
        }
    }

    saveEncounter(encounter: EncounterData): SavedEncounter[] {
        const encounters = this.listEncounters(encounter.name);
        const existingIndex = encounters.findIndex(savedEncounter =>
            savedEncounter.name.toLowerCase() === encounter.name.toLowerCase()
        );
        const existingId = existingIndex >= 0 ? encounters[existingIndex].id : crypto.randomUUID();
        const savedEncounter: SavedEncounter = {
            id: existingId,
            ...encounter
        };

        if (existingIndex >= 0) {
            encounters.splice(existingIndex, 1);
        }

        encounters.unshift(savedEncounter);
        this.persistEncounters(encounters);

        return encounters;
    }

    deleteEncounter(id: string, defaultName: string): SavedEncounter[] {
        const encounters = this.listEncounters(defaultName)
            .filter(encounter => encounter.id !== id);

        this.persistEncounters(encounters);

        return encounters;
    }

    private persistEncounters(encounters: SavedEncounter[]) {
        localStorage.setItem(SAVED_ENCOUNTERS_STORAGE_KEY, JSON.stringify(encounters));
    }
}
