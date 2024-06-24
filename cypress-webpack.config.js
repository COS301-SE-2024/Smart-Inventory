export const module = {
    rules: [
        {
            test: /\.css$/i,
            use: ['style-loader', 'css-loader'],
        },
    ],
};
export const externals = [
    {
        './inventory.component.css': 'null',
    },
];