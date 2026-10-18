# MIRARIM: La misión del maletín

Juego web interactivo completo en español para niños de 4-8 años (con acompañamiento adulto).

## Cómo abrir y probar

1. Abre `index.html` en un navegador moderno (Chrome, Firefox, Edge, Safari).
2. Funciona sin servidor. Doble clic o arrastra a la ventana del navegador.
3. En móvil horizontal o tablet se adapta. En vertical muestra aviso de girar.
4. Usa el botón "Acompañante" para configuración, video local, etc.

## Recursos visuales

- Logotipos: coloca los archivos `logo-color.png`, `logo-dark.png` y `logo-white.png` en `assets/logos/`.
- Avatares: placeholders de colores (puedes sustituirlos editando el array `avatars` en `game.js`).

## Cómo incorporar el video final

- **Temporal (sesión):** En la pantalla de video o panel acompañante, selecciona un archivo MP4 local. Se reproduce con controles HTML5 reales.
- **Permanente:** Coloca un archivo `cierre.mp4` en `assets/` y ajusta la ruta en `game.js`.

## Cómo modificar textos

Edita `texts.js`. Todos los mensajes principales están centralizados.

## Limitaciones reales

- Misiones funcionales pero simplificadas (matching por clic, colocación de tablones, selección de caminos).
- Narración usa síntesis de voz del navegador.
- No hay persistencia entre sesiones. "Nueva sesión" recarga.
- Los logotipos reales deben añadirse manualmente a la carpeta assets.

Disfruta explorando con calma.
