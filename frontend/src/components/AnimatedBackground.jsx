import { useEffect, useRef } from 'react';

/**
 * Futuristic AI/education animated background.
 * - Canvas particle network with connecting lines
 * - Gradient orbs (deep blue / indigo / cyan)
 * - Floating translucent shapes (circles, hexagons)
 */
export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];
    const COUNT = 50;
    const LINK = 110;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    class P {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 1.8 + 0.8;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129, 140, 248, 0.45)';
        ctx.fill();
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new P());

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) { p.update(); p.draw(); }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(129,140,248,${0.12 * (1 - d / LINK)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

    const shapes = [
      { icon: '🎓', top: '10%', left: '5%',  delay: '0s',   dur: '12s', size: '2.5rem', opacity: 0.15 },
      { icon: '💼', top: '15%', left: '85%', delay: '2s',   dur: '14s', size: '2rem',   opacity: 0.12 },
      { icon: '🚀', top: '75%', left: '8%',  delay: '4s',   dur: '15s', size: '3rem',   opacity: 0.14 },
      { icon: '🧠', top: '12%', left: '50%', delay: '1s',   dur: '13s', size: '2.2rem', opacity: 0.15 },
      { icon: '📊', top: '80%', left: '85%', delay: '5s',   dur: '14s', size: '2.2rem', opacity: 0.12 },
      { icon: '💡', top: '55%', left: '5%',  delay: '3s',   dur: '16s', size: '2rem',   opacity: 0.10 },
      { icon: '📚', top: '90%', left: '45%', delay: '6s',   dur: '12s', size: '2.2rem', opacity: 0.13 },
      { icon: '🤖', top: '35%', left: '90%', delay: '1.5s', dur: '14s', size: '1.8rem', opacity: 0.11 },
      { icon: '🔬', top: '45%', left: '80%', delay: '7s',   dur: '15s', size: '2rem',   opacity: 0.12 },
    ];

    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0 }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Gradient orbs */}
        <div className="absolute rounded-full animate-pulse-glow" style={{
          width: 600, height: 600, top: '-15%', left: '-10%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(80px)',
        }} />
        <div className="absolute rounded-full animate-pulse-glow" style={{
          width: 500, height: 500, bottom: '-10%', right: '-10%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', filter: 'blur(70px)',
          animationDelay: '2s',
        }} />

        {/* Floating icons with dashed line paths effect (simulated via animation) */}
        {shapes.map((s, i) => (
          <div key={i} className="absolute text-blue-400/20" style={{
            top: s.top, left: s.left, fontSize: s.size, opacity: s.opacity,
            animation: `float ${s.dur} ease-in-out ${s.delay} infinite`,
            filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.3))',
          }}>{s.icon}</div>
        ))}

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[#030712]/95" />
      </div>
    );
}
