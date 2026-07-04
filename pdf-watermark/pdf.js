document.addEventListener('DOMContentLoaded', () => {
  const tr = (key) => (window.I18N && window.I18N.t ? window.I18N.t(key) : key);

  const fileInput  = document.getElementById('pdf-file-input');
  const dropZone   = document.getElementById('pdf-drop-zone');
  if (!fileInput || !dropZone) return;

  const fileNameEl  = document.getElementById('pdf-file-name');
  const textInput   = document.getElementById('pdf-wm-text');
  const sizeInput   = document.getElementById('pdf-wm-size');
  const opacityInput= document.getElementById('pdf-wm-opacity');
  const angleInput  = document.getElementById('pdf-wm-angle');
  const colorInput  = document.getElementById('pdf-wm-color');
  const applyBtn    = document.getElementById('pdf-apply-btn');
  const statusEl    = document.getElementById('pdf-status');
  const sizeVal     = document.getElementById('pdf-size-val');
  const opacityVal  = document.getElementById('pdf-opacity-val');
  const angleVal    = document.getElementById('pdf-angle-val');

  let selectedFile  = null;

  sizeInput.addEventListener('input',    () => { sizeVal.textContent    = sizeInput.value; });
  opacityInput.addEventListener('input', () => { opacityVal.textContent = opacityInput.value + '%'; });
  angleInput.addEventListener('input',   () => { angleVal.textContent   = angleInput.value + '°'; });

  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.className   = 'pdf-status' + (type ? ' ' + type : '');
  }

  function pickFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      setStatus(tr('pdf.status.onlyPdf'), 'error'); return;
    }
    selectedFile = file;
    fileNameEl.textContent = '📎 ' + file.name + ' (' + (file.size/1024/1024).toFixed(2) + ' MB)';
    dropZone.classList.add('has-file');
    applyBtn.disabled = false;
    setStatus('');
  }

  fileInput.addEventListener('change', () => pickFile(fileInput.files[0]));
  ['dragover','dragenter'].forEach(ev => dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add('dragging'); }));
  ['dragleave','dragend'].forEach(ev  => dropZone.addEventListener(ev, () => dropZone.classList.remove('dragging')));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('dragging');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
  });

  function makeWatermarkPng(wPts, hPts, opts) {
    const scale = Math.min(2, 2000 / Math.max(wPts, hPts));
    const cw = Math.max(1, Math.round(wPts * scale));
    const ch = Math.max(1, Math.round(hPts * scale));
    const canvas = document.createElement('canvas');
    canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext('2d');
    const fontPx = opts.size * scale;
    ctx.font = 'bold ' + fontPx + 'px \'Noto Sans KR\', \'Outfit\', sans-serif';
    ctx.fillStyle = opts.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const angle = -opts.angle * Math.PI / 180;
    if (opts.layout === 'center') {
      ctx.save(); ctx.translate(cw/2, ch/2); ctx.rotate(angle); ctx.fillText(opts.text, 0, 0); ctx.restore();
    } else {
      const tw = Math.max(ctx.measureText(opts.text).width, fontPx);
      const stepX = tw + fontPx * 1.5;
      const stepY = fontPx * 3;
      for (let y = -ch; y < ch*2; y += stepY)
        for (let x = -cw; x < cw*2; x += stepX) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillText(opts.text, 0, 0); ctx.restore();
        }
    }
    return canvas.toDataURL('image/png');
  }

  function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const bin    = atob(base64);
    const bytes  = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  applyBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    if (typeof PDFLib === 'undefined') { setStatus(tr('pdf.status.noLib'), 'error'); return; }
    const text = (textInput.value || '').trim();
    if (!text) { setStatus(tr('pdf.status.needText'), 'error'); textInput.focus(); return; }

    const opts = {
      text, size: parseInt(sizeInput.value, 10),
      opacity: parseInt(opacityInput.value, 10) / 100,
      angle: parseInt(angleInput.value, 10), color: colorInput.value,
      layout: (document.querySelector('input[name="pdf-layout"]:checked') || {}).value || 'tiled'
    };

    applyBtn.disabled = true;
    setStatus(tr('pdf.status.processing'), 'loading');

    try {
      const bytes  = new Uint8Array(await selectedFile.arrayBuffer());
      const pdfDoc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages  = pdfDoc.getPages();
      const cache  = {};

      for (const page of pages) {
        const { width, height } = page.getSize();
        const key = Math.round(width) + 'x' + Math.round(height);
        if (!cache[key]) {
          const pngBytes = dataUrlToBytes(makeWatermarkPng(width, height, opts));
          cache[key] = await pdfDoc.embedPng(pngBytes);
        }
        page.drawImage(cache[key], { x: 0, y: 0, width, height, opacity: opts.opacity });
      }

      const out  = await pdfDoc.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = selectedFile.name.replace(/\.pdf$/i, '') + '_watermarked.pdf';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setStatus(tr('pdf.status.done').replace('{n}', pages.length), 'success');
    } catch (err) {
      console.error(err); setStatus(tr('pdf.status.fail'), 'error');
    } finally {
      applyBtn.disabled = false;
    }
  });
});
