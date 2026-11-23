# Regalo de flores – versión ampliada

## Cómo abrirlo

1. Descomprime el ZIP completo.
2. Para evitar restricciones del navegador con audio y almacenamiento, abre la carpeta con Visual Studio Code y ejecútala con la extensión **Live Server** (clic derecho en `index.html` → **Open with Live Server**).
3. También puedes publicarlo en un hosting estático. Mantén juntas las carpetas `paginas/` y `musica/` junto a `index.html`, `script.js` y `style.css`. Las cinco páginas secundarias y sus archivos compartidos están agrupados dentro de `paginas/`.
4. Pulsa **Ver las Flores**. La música principal se intenta iniciar como consecuencia de ese clic. Si el navegador bloquea el audio de una página individual, utiliza los controles de reproducción que aparecen en ella.

## Personalizar el mensaje del jardín

Abre `script.js` y modifica `GARDEN_CONFIG.message`. Ese texto aparece después de la presentación de crecimiento. No se ha inventado un mensaje definitivo: el contenido actual es un texto de ejemplo que debes sustituir.

## Personalizar las cinco páginas

Abre `paginas/contenido-paginas.js`. Cada número corresponde permanentemente a una flor:

- `1`: `paginas/flor-1.html`
- `2`: `paginas/flor-2.html`
- `3`: `paginas/flor-3.html`
- `4`: `paginas/flor-4.html`
- `5`: `paginas/flor-5.html`

En cada entrada puedes cambiar `title`, `text` y `audio`. El contenido se inserta como texto, por lo que los saltos de línea se conservan y el navegador evita interpretar el texto como HTML.

## Añadir las canciones

Copia tus seis archivos MP3 dentro de la carpeta `musica/` con estos nombres exactos:

- `cancion-principal.mp3`
- `cancion-1.mp3`
- `cancion-2.mp3`
- `cancion-3.mp3`
- `cancion-4.mp3`
- `cancion-5.mp3`

Si quieres usar otros nombres o formatos compatibles, actualiza las rutas en `script.js` y `paginas/contenido-paginas.js`. No se incluyen canciones porque todavía no fueron suministradas.

## Funcionamiento del ciclo

- La primera visita comienza con la bienvenida original.
- Al pulsar el botón, se inicia la canción principal y se muestra el jardín.
- Tras el crecimiento aparece el texto; las flores se habilitan al terminar la entrada del texto.
- Cada flor abre su propia página y su pista individual.
- Al regresar, la flor visitada queda marchita y deshabilitada.
- Cuando las cinco han sido visitadas, se inicia el crecimiento de un nuevo ciclo.
- El estado se conserva con `localStorage`. Para reiniciar manualmente las pruebas, abre las herramientas del navegador → Application/Almacenamiento → Local Storage y elimina la clave `jardinFloresEstadoV1`.

## Notas técnicas y pruebas

Se corrigió la etiqueta `body` duplicada del HTML original. Se conservaron las estructuras CSS originales de las cinco flores y del jardín, y se añadieron páginas, estilos y lógica de navegación. Las canciones y los textos definitivos quedan pendientes de los archivos/contenidos que proporciones.

Se verificó la sintaxis de los archivos JavaScript con Node.js y la estructura de etiquetas de las seis páginas HTML. No se pudo certificar aquí una prueba visual completa en todos los navegadores y tamaños de pantalla; antes de publicar, revisa el resultado en un computador y un celular reales. La reproducción automática de audio depende de las políticas del navegador: la pista principal se inicia directamente desde el clic y las páginas individuales incluyen controles como alternativa.


## Cambios de esta revisión

- **Ubicación de las flores:** vuelve a ser exactamente la del original (ramo en el centro inferior, con las mismas inclinaciones, alturas y balanceo). Cada flor es ahora un `div` como en el original; se pulsa con clic, toque o teclado (Enter/Espacio).
- **Marchitamiento:** la flor visitada se apaga y inclina la cabeza sin moverse de lugar; al reiniciarse el ciclo recupera su color poco a poco.
- **Audio de las páginas secundarias:** solo se reproduce. No hay controles visibles y se bloquea pausar, adelantar, retroceder, cambiar la velocidad y las teclas multimedia (teclado, auriculares, pantalla de bloqueo). Si el navegador impide el inicio automático, aparece un único botón «Toca para iniciar la música», que desaparece al empezar. La canción termina sola o al pulsar «Volver al jardín».

- **Portada de inicio:** es la del original (frase, «Señora Watts», «Esto es para ti», 🌻 y «Ver las Flores») y aparece siempre que se abre el programa, antes de ver las flores. Solo se omite al volver desde la página de una flor. Las flores ya visitadas se conservan marchitas hasta completar el ciclo.
