# LlamaLeads Landing

Landing exportada desde LeadConnector / GoHighLevel para la oferta de auditoria de embudo de LlamaLeads.

## Estructura

- `MAIN.html`: pagina exportada principal. Actualmente conserva HTML, CSS y JavaScript embebidos por la plataforma.
- `public/assets/images/brand`: isotipo y recursos de marca de LlamaLeads.
- `public/assets/images/client-logos-card`: logos usados en tarjetas de casos.
- `public/assets/images/client-logos-gold`: logos normalizados para la grilla de rubros/clientes.
- `public/assets/images/clients`: logos originales de clientes o casos.
- `public/assets/images/offer-icons`: iconos 3D de la seccion de oferta.
- `public/assets/images/placeholders`: imagenes temporales o placeholders.
- `public/assets/images/previews`: capturas o previews usados como referencia interna.
- `public/assets/images/team`: fotos originales y crops del equipo.
- `public/assets/styles`: hojas de estilo externas exportadas o auxiliares.
- `public/assets/scripts/vendor`: librerias de terceros usadas por la landing.
- `public/assets/scripts/platform`: scripts generados o requeridos por plataformas externas.
- `public/assets/content/case-studies-source`: markdown fuente de casos de exito.
- `public/case-studies`: contenido servido por el panel de casos de exito.

## Preview local

Desde esta carpeta:

```sh
python3 -m http.server 4173
```

Abrir:

```text
http://localhost:4173/MAIN.html
```

## Nota de mantenimiento

Este proyecto todavia es un export monolitico. El siguiente paso natural para desarrollo frontend seria separar el CSS y JavaScript propio de `MAIN.html`, dejando el runtime de LeadConnector aislado o reemplazandolo por una implementacion estatica mas limpia.
