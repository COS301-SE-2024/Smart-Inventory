import { defineConfig } from 'cypress';

export default defineConfig({
    component: {
        devServer: {
            framework: 'angular',
            bundler: 'webpack',
            options: {
                projectConfig: {
                    root: '',
                    sourceRoot: 'src',
                    buildOptions: {
                        outputPath: 'dist',
                        index: 'src/index.html',
                        main: 'src/main.ts',
                        polyfills: ['zone.js'],
                        tsConfig: 'tsconfig.app.json',
                        assets: ['src/assets'],
                        styles: [
                            'node_modules/ag-grid-community/styles/ag-grid.css',
                            'node_modules/ag-grid-community/styles/ag-theme-alpine.css',
                            'node_modules/@aws-amplify/ui-angular/theme.css',
                            'src/styles.css',
                        ],
                        scripts: [],
                    },
                },
            },
        },
        specPattern: '**/*.cy.ts',
    },
});
