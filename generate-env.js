const fs = require('fs');

const environmentFile = `
export const environment = {
  production: ${process.env.PRODUCTION || false},
  apiKey: '${process.env.API_KEY}'
};
`;

fs.writeFileSync('./src/environments/environment.ts', environmentFile);