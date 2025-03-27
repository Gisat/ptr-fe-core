import path from 'path';
import nodeExternals from 'webpack-node-externals';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

export default {
    entry: './index.ts',
    output: {
        path: path.resolve('./dist'),
        filename: 'index.js',
        library: {
            type: 'module'
        },
        environment: {
            module: true,
        },
        clean: true,
    },

    experiments: {
        outputModule: true
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true
                    }
                },
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false,
                        },
                    },
                    'postcss-loader',
                ],
            },

        ],
    },
    plugins: [

        new MiniCssExtractPlugin({
            filename: 'index.css',
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ],

    },
    externals: [

        nodeExternals({
            importType: "module",
        }),
        {
            'react': 'react',
            'react-dom': 'react-dom',
            '@mantine/core': '@mantine/core',
            'deck.gl/core': 'deck.gl/core',
            'deck.gl/react': 'deck.gl/react',
            'openid-client': 'openid-client',
            'modern-normalize':'modern-normalize'
        },


    ],
    mode: 'production',
    devtool: 'source-map',
};
