/** @type {import('next').NextConfig} */
const nextConfig = {
  // Désactiver l'overlay de dev en erreur
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  
  // Option: désactiver complètement l'overlay
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig