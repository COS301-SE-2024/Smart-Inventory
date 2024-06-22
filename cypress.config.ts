// import { defineConfig } from "cypress";

// export default defineConfig({
//   component: {
//     devServer: {
//       framework: "angular",
//       bundler: "webpack",
//     },
//     specPattern: "**/*.cy.ts",
//   },
// });

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
                        outputPath: 'dist/smart-inventory',
                        index: 'src/index.html',
                        browser: 'src/main.ts',
                        polyfills: ['zone.js'],
                        tsConfig: 'tsconfig.app.json',
                        assets: [
                            {
                                glob: '**/*',
                                input: 'public',
                            },
                        ],
                        styles: [
                            '@angular/material/prebuilt-themes/azure-blue.css',
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