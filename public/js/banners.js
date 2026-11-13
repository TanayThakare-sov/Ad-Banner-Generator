/* Core banner logic: sizes, brand rules, validation, canvas drawing, HTML export.
   Works in the browser (window.Banners) and in Node (for tests). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Banners = factory();
})(this, function () {
  var SIZES = [
    { id: '300x250', w: 300, h: 250, name: 'Medium Rectangle' },
    { id: '728x90', w: 728, h: 90, name: 'Leaderboard' },
    { id: '160x600', w: 160, h: 600, name: 'Wide Skyscraper' },
    { id: '320x50', w: 320, h: 50, name: 'Mobile Banner' }
  ];
  var BRAND = {
    font: 'Arial, Helvetica, sans-serif',
    colors: { Blue: '#0a5cff', Purple: '#7a00e6', Green: '#0b7a3e', Dark: '#101828' },
    max: { headline: 40, offer: 30, cta: 18 }
  };

  function hexToRgb(h) {
    var n = parseInt(h.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function luminance(hex) {
    var c = hexToRgb(hex).map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function validate(d) {
    var errors = [], warnings = [];
    if (!d.headline || !d.headline.trim()) errors.push('Headline is required.');
    if (!d.cta || !d.cta.trim()) errors.push('Call-to-action text is required.');
    if (d.headline && d.headline.length > BRAND.max.headline) errors.push('Headline is over ' + BRAND.max.headline + ' characters.');
    if (d.offer && d.offer.length > BRAND.max.offer) errors.push('Offer is over ' + BRAND.max.offer + ' characters.');
    if (d.cta && d.cta.length > BRAND.max.cta) errors.push('CTA is over ' + BRAND.max.cta + ' characters.');
    if (!Object.keys(BRAND.colors).some(function (k) { return BRAND.colors[k] === d.color; })) errors.push('Color is not in the brand palette.');
    else if (contrast(d.color, '#ffffff') < 4.5) warnings.push('Low contrast between background and white text.');
    return { errors: errors, warnings: warnings };
  }

  function fit(ctx, text, maxW, start, min) {
    var s = start;
    while (s > min) { ctx.font = 'bold ' + s + 'px ' + BRAND.font; if (ctx.measureText(text).width <= maxW) break; s--; }
    ctx.font = 'bold ' + s + 'px ' + BRAND.font;
    return s;
  }
  function wrap(ctx, text, maxW) {
    var words = text.split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
    });
    if (line) lines.push(line);
    return lines;
  }
  function button(ctx, x, y, w, h, text, d, fs) {
    ctx.fillStyle = '#ffffff'; ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.fillStyle = d.color; ctx.font = 'bold ' + fs + 'px ' + BRAND.font;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2 + 1); ctx.textAlign = 'left';
  }

  function draw(canvas, d, size, img) {
    var w = size.w, h = size.h, ctx = canvas.getContext('2d');
    canvas.width = w; canvas.height = h;
    ctx.fillStyle = d.color; ctx.fillRect(0, 0, w, h);
    if (img) {
      var r = Math.max(w / img.width, h / img.height), iw = img.width * r, ih = img.height * r;
      ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, w, h);
    }
    ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    var pad = Math.round(Math.min(w, h) * 0.08) + 4;
    if (w / h >= 3) { // horizontal
      var btnW = Math.min(150, w * 0.24), btnH = Math.round(h * 0.55), avail = w - btnW - pad * 3;
      var showOffer = h >= 80 && d.offer, fs = fit(ctx, d.headline, avail, Math.round(h * 0.3), 9);
      var top = showOffer ? (h - fs * 2.1) / 2 : (h - fs) / 2;
      ctx.fillText(d.headline, pad, top);
      if (showOffer) { ctx.font = Math.round(fs * 0.7) + 'px ' + BRAND.font; ctx.fillText(d.offer, pad, top + fs * 1.3); }
      button(ctx, w - btnW - pad, (h - btnH) / 2, btnW, btnH, d.cta, d, Math.max(9, Math.round(btnH * 0.4)));
    } else { // stacked
      var hf = Math.max(14, Math.round(w * 0.09)), y = pad;
      ctx.font = 'bold ' + hf + 'px ' + BRAND.font;
      wrap(ctx, d.headline, w - pad * 2).forEach(function (l) { ctx.fillText(l, pad, y); y += hf * 1.2; });
      if (d.offer) {
        y += hf * 0.4; var of = Math.round(hf * 0.75); ctx.font = of + 'px ' + BRAND.font;
        wrap(ctx, d.offer, w - pad * 2).forEach(function (l) { ctx.fillText(l, pad, y); y += of * 1.3; });
      }
      var bh = Math.round(hf * 2);
      button(ctx, pad, h - bh - pad, w - pad * 2, bh, d.cta, d, Math.round(hf * 0.8));
    }
  }

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toHTML(d, size, imgData) {
    var bg = imgData ? 'linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(' + imgData + ') center/cover' : d.color;
    var wide = size.w / size.h >= 3, fs = wide ? Math.round(size.h * 0.26) : Math.max(14, Math.round(size.w * 0.09));
    return '<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><title>' + esc(d.headline) + ' ' + size.id + '</title>\n<style>\n' +
      'body{margin:0}.ad{width:' + size.w + 'px;height:' + size.h + 'px;background:' + bg + ';color:#fff;font-family:' + BRAND.font + ';box-sizing:border-box;padding:8px 12px;display:flex;flex-direction:' + (wide ? 'row' : 'column') + ';justify-content:space-between;align-items:' + (wide ? 'center' : 'stretch') + ';overflow:hidden}\n' +
      '.ad h1{margin:0;font-size:' + fs + 'px;line-height:1.2}.ad p{margin:4px 0 0;font-size:' + Math.round(fs * 0.75) + 'px}\n' +
      '.ad a{background:#fff;color:' + d.color + ';text-decoration:none;font-weight:bold;text-align:center;padding:8px 14px;border-radius:6px;font-size:' + Math.max(10, Math.round(fs * 0.7)) + 'px}\n</style></head>\n' +
      '<body><div class="ad"><div><h1>' + esc(d.headline) + '</h1>' + (d.offer ? '<p>' + esc(d.offer) + '</p>' : '') + '</div><a href="#">' + esc(d.cta) + '</a></div></body></html>\n';
  }
  return { SIZES: SIZES, BRAND: BRAND, contrast: contrast, validate: validate, draw: draw, toHTML: toHTML };
});
