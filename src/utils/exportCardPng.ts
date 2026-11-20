import type { Card } from '../types/zhar';

export async function downloadCardAsPng(card: Card): Promise<void> {
  const width = 640;
  const height = 920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#101C32');
  grad.addColorStop(0.5, card.accentColor || '#2377B9');
  grad.addColorStop(1, '#101C32');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Inner card surface
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(22, 22, width - 44, height - 44, 28);
  ctx.fill();

  // Artwork box
  const artX = 42;
  const artY = 104;
  const artW = width - 84;
  const artH = 420;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(artX, artY, artW, artH, 18);
  ctx.clip();

  const imgGrad = ctx.createLinearGradient(artX, artY, artX + artW, artY + artH);
  imgGrad.addColorStop(0, '#DDF3FF');
  imgGrad.addColorStop(1, '#75C9FF');
  ctx.fillStyle = imgGrad;
  ctx.fillRect(artX, artY, artW, artH);

  if (card.imageUrl) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = card.imageUrl;
      });
      const scale = Math.max(artW / img.width, artH / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, artX + (artW - dw) / 2, artY + (artH - dh) / 2, dw, dh);
    } catch {
      // Fallback gradient stays cleanly visible
    }
  }
  ctx.restore();

  // Header text
  ctx.fillStyle = '#101C32';
  ctx.font = 'bold 28px Poppins, sans-serif';
  ctx.fillText(card.name.slice(0, 26), 44, 72);

  // Rarity & Element
  ctx.fillStyle = '#2377B9';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.fillText(`${card.rarity} · ${card.element.toUpperCase()}`, 44, 560);

  if (!card.isOfficial) {
    ctx.fillStyle = '#A78BFA';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('CUSTOM CARD', width - 170, 560);
  }

  // Stats row
  const stats = [
    { label: 'HP', value: String(card.hp) },
    { label: 'ATK', value: String(card.attack) },
    { label: 'DEF', value: String(card.defense) },
  ];
  stats.forEach((st, idx) => {
    const sx = 44 + idx * 190;
    ctx.fillStyle = '#DDF3FF';
    ctx.beginPath();
    ctx.roundRect(sx, 582, 172, 72, 14);
    ctx.fill();

    ctx.fillStyle = '#2377B9';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText(st.label, sx + 16, 608);

    ctx.fillStyle = '#101C32';
    ctx.font = 'bold 26px JetBrains Mono, monospace';
    ctx.fillText(st.value, sx + 16, 640);
  });

  // Skill
  ctx.fillStyle = '#101C32';
  ctx.font = 'bold 20px Poppins, sans-serif';
  ctx.fillText(`Skill: ${card.skillName}`, 44, 696);

  ctx.fillStyle = '#334155';
  ctx.font = '16px Inter, sans-serif';
  wrapText(ctx, card.skillDescription, 44, 728, width - 88, 22, 3);

  // Lore
  ctx.fillStyle = '#64748B';
  ctx.font = 'italic 15px Inter, sans-serif';
  wrapText(ctx, card.description, 44, 808, width - 88, 20, 2);

  // Footer watermark
  ctx.fillStyle = '#2377B9';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillText(`ZharCard · ZharWorld · Creator: ${card.creatorName}`, 44, 875);

  const link = document.createElement('a');
  link.download = `${card.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_zharcard.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(' ');
  let line = '';
  let lineCount = 0;
  for (let i = 0; i < words.length; i++) {
    const testLine = `${line}${words[i]} `;
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
      line = `${words[i]} `;
      lineCount++;
      if (lineCount >= maxLines) return;
    } else {
      line = testLine;
    }
  }
  if (lineCount < maxLines) {
    ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
  }
}
