import { LoaderComponent } from '../../src/app/components/loader/loader.component';
import { LoadingService } from '../../src/app/components/loader/loading.service';
import { BehaviorSubject } from 'rxjs';

describe('LoaderComponent', () => {
    let loadingSubject: BehaviorSubject<boolean>;
    let loadingServiceStub: LoadingService;

    beforeEach(() => {
        loadingSubject = new BehaviorSubject<boolean>(false);
        loadingServiceStub = {
            isLoading$: loadingSubject.asObservable(),
            setLoading: (isLoading: boolean) => loadingSubject.next(isLoading),
        } as LoadingService;
        console.log('loadingServiceStub:', loadingServiceStub);
    });

    it('should not display loader when isLoading$ is false', () => {
        cy.mount(LoaderComponent, {
            providers: [{ provide: LoadingService, useValue: loadingServiceStub }],
        });

        cy.get('.loading').should('not.exist');
    });

    it('should display loader when isLoading$ is true', () => {
        loadingServiceStub.setLoading(true);

        cy.mount(LoaderComponent, {
            providers: [{ provide: LoadingService, useValue: loadingServiceStub }],
        });

        cy.get('.loading').should('be.visible');
    });
});
