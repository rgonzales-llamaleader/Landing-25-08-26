(function(){
  document.documentElement.dataset.caseStudyBootstrap = 'start';

  var caseStudyFiles = {
    1: { name: 'Almahal Spa', sector: 'Wellness & Spa Premium · Lima', color: '#B8973A', url: 'public/case-studies/almahal.md' },
    2: { name: 'Trim Gym', sector: 'Gym Boutique Premium · Lima', color: '#DB0000', url: 'public/case-studies/trim-gym.md' },
    3: { name: 'Deporclub', sector: 'Academia Deportiva · Lima', color: '#F1C721', url: 'public/case-studies/deporclub.md' },
    4: { name: 'Elevate Studio', sector: 'Studio Fitness Boutique · Lima', color: '#7ABFBF' }
  };

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"']/g, function(char){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char];
    });
  }

  function inlineMd(value){
    return escapeHtml(value)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  function flushList(html, list){
    if(!list.items.length) return;
    html.push('<' + list.type + '>' + list.items.map(function(item){
      return '<li>' + inlineMd(item) + '</li>';
    }).join('') + '</' + list.type + '>');
    list.items = [];
  }

  function parseTable(lines, start){
    var rows = [];
    var i = start;
    while(i < lines.length && /^\s*\|.+\|\s*$/.test(lines[i])){
      rows.push(lines[i]);
      i++;
    }
    if(rows.length < 2 || !/^\s*\|?[\s:-]+\|[\s|:-]+\|?\s*$/.test(rows[1])) return null;

    function cells(row){
      return row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(function(cell){
        return inlineMd(cell.trim());
      });
    }

    var head = cells(rows[0]);
    var body = rows.slice(2).map(cells);
    var html = '<table><thead><tr>' + head.map(function(cell){
      return '<th>' + cell + '</th>';
    }).join('') + '</tr></thead><tbody>' + body.map(function(row){
      return '<tr>' + row.map(function(cell){
        return '<td>' + cell + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table>';

    return { html: html, next: i };
  }

  function markdownToHtml(markdown){
    var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    if(lines.length && /^#\s+Caso de éxito:/i.test(lines[0].trim())){
      lines.shift();
      while(lines.length && !lines[0].trim()) lines.shift();
    }
    var html = [];
    var list = { type: 'ul', items: [] };
    var paragraph = [];

    function flushParagraph(){
      if(!paragraph.length) return;
      html.push('<p>' + inlineMd(paragraph.join(' ')) + '</p>');
      paragraph = [];
    }

    for(var i = 0; i < lines.length; i++){
      var line = lines[i];
      if(!line.trim()){
        flushParagraph();
        flushList(html, list);
        continue;
      }

      var table = parseTable(lines, i);
      if(table){
        flushParagraph();
        flushList(html, list);
        html.push(table.html);
        i = table.next - 1;
        continue;
      }

      var heading = /^(#{1,3})\s+(.+)$/.exec(line);
      if(heading){
        flushParagraph();
        flushList(html, list);
        var level = heading[1].length === 1 ? 1 : 2;
        html.push('<h' + level + '>' + inlineMd(heading[2]) + '</h' + level + '>');
        continue;
      }

      var bullet = /^\s*[-*]\s+(.+)$/.exec(line);
      if(bullet){
        flushParagraph();
        if(list.type !== 'ul') flushList(html, list);
        list.type = 'ul';
        list.items.push(bullet[1]);
        continue;
      }

      var ordered = /^\s*\d+\.\s+(.+)$/.exec(line);
      if(ordered){
        flushParagraph();
        if(list.type !== 'ol') flushList(html, list);
        list.type = 'ol';
        list.items.push(ordered[1]);
        continue;
      }

      paragraph.push(line.trim());
    }

    flushParagraph();
    flushList(html, list);
    return html.join('');
  }

  function panelShell(meta, body){
    return '<div class="cp-md">' +
      '<div class="cp-sticky-head">' +
        '<div class="cp-handle"></div>' +
        '<button class="cp-inline-close" type="button" aria-label="Cerrar caso">✕</button>' +
        '<div class="cp-eyebrow">Caso de éxito</div>' +
        '<div class="cp-title" style="color:' + meta.color + '">' + escapeHtml(meta.name) + '</div>' +
        '<div class="cp-sector">' + escapeHtml(meta.sector || '') + '</div>' +
      '</div>' +
      '<div class="cp-md-body">' + body + '</div>' +
      '</div>';
  }

  function closeCase(){
    var panel = document.getElementById('casePanel');
    if(panel) panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function openCase(n){
    var meta = caseStudyFiles[n];
    var panel = document.getElementById('casePanel');
    var content = document.getElementById('cpContent');
    if(!meta || !panel || !content) return;

    panel.classList.add('open');
    document.body.style.overflow = 'hidden';

    if(!meta.url){
      content.innerHTML = panelShell(meta, '<div class="cp-empty">Este case study aún no tiene archivo Markdown asociado.</div>');
      bindInlineClose();
      return;
    }

    content.innerHTML = panelShell(meta, '<div class="cp-loading">Cargando case study...</div>');
    bindInlineClose();

    try {
      var response = await fetch(encodeURI(meta.url), { cache: 'no-store' });
      if(!response.ok) throw new Error('No se pudo cargar el archivo.');
      var markdown = await response.text();
      content.innerHTML = panelShell(meta, markdownToHtml(markdown));
      bindInlineClose();
    } catch(error) {
      content.innerHTML = panelShell(meta, '<div class="cp-empty">No se pudo cargar este case study. Revisa que el archivo exista en <strong>' + escapeHtml(meta.url) + '</strong>.</div>');
      bindInlineClose();
    }
  }

  function bindInlineClose(){
    var closeButton = document.querySelector('#casePanel .cp-inline-close');
    if(closeButton && closeButton.dataset.caseBound !== 'true'){
      closeButton.dataset.caseBound = 'true';
      closeButton.addEventListener('click', closeCase);
    }
  }

  function bindCaseCards(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.orbit-card, .lm-result-card'));
    cards.forEach(function(card){
      if(card.dataset.caseBound === 'true') return;
      var match = (card.getAttribute('onclick') || '').match(/openCase\((\d+)\)/);
      if(!match) return;
      card.dataset.caseBound = 'true';
      card.addEventListener('click', function(event){
        event.preventDefault();
        openCase(Number(match[1]));
      });
    });

    var overlay = document.querySelector('#casePanel .cp-overlay');
    var closeButton = document.querySelector('#casePanel .cp-close');
    if(overlay && overlay.dataset.caseBound !== 'true'){
      overlay.dataset.caseBound = 'true';
      overlay.addEventListener('click', closeCase);
    }
    if(closeButton && closeButton.dataset.caseBound !== 'true'){
      closeButton.dataset.caseBound = 'true';
      closeButton.addEventListener('click', closeCase);
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bindCaseCards, { once: true });
  } else {
    bindCaseCards();
  }
  window.addEventListener('load', bindCaseCards, { once: true });
  document.documentElement.dataset.caseStudyBootstrap = 'ready';
})();
