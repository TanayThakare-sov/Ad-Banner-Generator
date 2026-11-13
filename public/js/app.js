(function () {
  var $ = function (id) { return document.getElementById(id); };
  var img = null, imgData = null;
  var f = { headline: $('headline'), offer: $('offer'), cta: $('cta'), color: $('color'), image: $('image') };

  Object.keys(Banners.BRAND.colors).forEach(function (name) {
    var o = document.createElement('option'); o.value = Banners.BRAND.colors[name]; o.textContent = name; f.color.appendChild(o);
  });

  function data() { return { headline: f.headline.value, offer: f.offer.value, cta: f.cta.value, color: f.color.value }; }
  function download(name, blob) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function render() {
    var d = data(), v = Banners.validate(d), out = $('previews');
    $('messages').innerHTML = v.errors.map(function (e) { return '<li class="err">' + e + '</li>'; }).concat(
      v.warnings.map(function (w) { return '<li class="warn">' + w + '</li>'; })).join('');
    out.innerHTML = '';
    if (v.errors.length) return;
    Banners.SIZES.forEach(function (s) {
      var card = document.createElement('figure'), c = document.createElement('canvas'), cap = document.createElement('figcaption');
      Banners.draw(c, d, s, img);
      cap.innerHTML = '<strong>' + s.id + '</strong> ' + s.name + ' ';
      var png = document.createElement('button'); png.textContent = 'PNG';
      png.onclick = function () { c.toBlob(function (b) { download('banner-' + s.id + '.png', b); }); };
      var html = document.createElement('button'); html.textContent = 'HTML';
      html.onclick = function () { download('banner-' + s.id + '.html', new Blob([Banners.toHTML(d, s, imgData)], { type: 'text/html' })); };
      cap.appendChild(png); cap.appendChild(html); card.appendChild(c); card.appendChild(cap); out.appendChild(card);
    });
  }

  f.image.addEventListener('change', function () {
    var file = f.image.files[0]; if (!file) { img = imgData = null; return render(); }
    var r = new FileReader();
    r.onload = function () { imgData = r.result; img = new Image(); img.onload = render; img.src = imgData; };
    r.readAsDataURL(file);
  });
  ['headline', 'offer', 'cta', 'color'].forEach(function (k) { f[k].addEventListener('input', render); });

  function loadTemplates() {
    fetch('/api/templates').then(function (r) { return r.json(); }).then(function (list) {
      var ul = $('templates'); ul.innerHTML = '';
      list.forEach(function (t) {
        var li = document.createElement('li'), b = document.createElement('button');
        b.textContent = t.name; b.onclick = function () {
          f.headline.value = t.headline; f.offer.value = t.offer; f.cta.value = t.cta; f.color.value = t.color; render();
        };
        li.appendChild(b); ul.appendChild(li);
      });
    }).catch(function () { $('templates').innerHTML = '<li>Run "npm start" to enable saved templates.</li>'; });
  }
  $('save').addEventListener('click', function () {
    var name = $('tname').value.trim(); if (!name) return alert('Enter a template name.');
    var body = data(); body.name = name;
    fetch('/api/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).then(function (res) { if (res.error) alert(res.error); else loadTemplates(); })
      .catch(function () { alert('Server not running. Use "npm start".'); });
  });
  render(); loadTemplates();
})();
