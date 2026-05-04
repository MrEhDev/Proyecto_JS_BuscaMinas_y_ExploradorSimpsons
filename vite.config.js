import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Tu ruta base actual de GitHub Pages
  base: '/Proyecto_JS_BuscaMinas_y_ExploradorSimpsons/', 
  
  // Configuramos el empaquetador para múltiples páginas
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        buscaminas: resolve(__dirname, 'buscaminas.html'),
        simpsons: resolve(__dirname, 'simpsons.html')
      }
    }
  }
})