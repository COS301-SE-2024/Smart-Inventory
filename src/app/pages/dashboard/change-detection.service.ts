import { Injectable, ChangeDetectorRef, ApplicationRef } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ChangeDetectionService {
    private changeDetectorRefs = new Set<ChangeDetectorRef>();

    constructor(private appRef: ApplicationRef) {}

    setChangeDetectorRef(ref: ChangeDetectorRef) {
        this.changeDetectorRefs.add(ref);
    }

    detectChanges() {
        this.changeDetectorRefs.forEach((ref) => ref.detectChanges());
    }

    detach() {
        this.changeDetectorRefs.forEach((ref) => ref.detach());
    }

    reattach() {
        this.changeDetectorRefs.forEach((ref) => ref.reattach());
    }

    markForCheck() {
        this.changeDetectorRefs.forEach((ref) => ref.markForCheck());
    }

    detectChangesInRootComponents() {
        this.appRef.tick();
    }
}
