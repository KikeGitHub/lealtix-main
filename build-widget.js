const esbuild = require('esbuild');
const path = require('path');

async function build() {
  const outdir = path.resolve(__dirname, 'dist', 'widget');
  try {
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, 'src', 'main-widget.ts')],
      bundle: true,
      minify: true,
      sourcemap: false,
      format: 'iife',
      globalName: 'OfferWidgetBundle',
      outfile: path.join(outdir, 'widget.js'),
      platform: 'browser',
      target: ['es2017'],
      logLevel: 'info',
      external: [
        '@angular/animations',
        '@angular/common',
        '@angular/core',
        '@angular/forms',
        '@angular/platform-browser',
        'rxjs',
        'zone.js'
      ],
    });
    console.log('Widget bundle created at', path.join(outdir, 'widget.js'));
  } catch (err) {
    console.error('esbuild failed:', err);
    process.exit(1);
  }
}

build();
