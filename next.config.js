// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: [
        "pdf2json",
        "@zilliz/milvus2-sdk-node",
        "sharp",
        "onnxruntime-node",
      ],
    },
    webpack: (config) => {
      config.externals.push({
        pdf2json: "commonjs pdf2json",
        "@zilliz/milvus2-sdk-node": "commonjs @zilliz/milvus2-sdk-node",
        sharp: "commonjs sharp",
        "onnxruntime-node": "commonjs onnxruntime-node",
      });
  
      return config;
    },
  };
  
  module.exports = nextConfig;