import config from './next.config.mjs';
console.log('Keys in nextConfig:', Object.keys(config));
console.log('Config values:', JSON.stringify(config, null, 2));
