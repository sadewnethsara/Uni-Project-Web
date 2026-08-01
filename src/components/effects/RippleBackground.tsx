"use client";

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// --- Type Definitions for Prop Safety ---
type TextElement = {
    type: 'text';
    content: string;
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    textBaseline?: 'top' | 'middle' | 'bottom';
    x: number;
    y: number;
};

type ImageElement = {
    type: 'image';
    src: string;
    width?: number;
    height?: number;
    opacity?: number;
    x: number;
    y: number;
    img?: HTMLImageElement | null;
};

type CanvasElement = TextElement | ImageElement;

interface RippleBackgroundProps {
  elements?: CanvasElement[];
}

const RippleBackground: React.FC<RippleBackgroundProps> = ({ elements = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    // --- 1. Mobile Detection ---
    let isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });

    // --- 2. Dynamic DPR for Performance ---
    const dpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const mouse = new THREE.Vector2(-1, -1);
    let frame = 0;

    const width = window.innerWidth * dpr;
    const height = window.innerHeight * dpr;
    const renderTargetOptions = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };
    let rtA = new THREE.WebGLRenderTarget(width, height, renderTargetOptions);
    let rtB = new THREE.WebGLRenderTarget(width, height, renderTargetOptions);

    // --- Shaders ---
    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        mouse: { value: mouse },
        resolution: { value: new THREE.Vector2(width, height) },
        frame: { value: 0 },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D textureA;
        uniform vec2 mouse;
        uniform vec2 resolution;
        uniform int frame;
        varying vec2 vUv;
        const float delta=1.4;
        void main(){
          vec2 uv=vUv;
          if(frame<2){gl_FragColor=vec4(0.);return;}
          vec4 data=texture2D(textureA,uv);
          float pressure=data.x;
          float pVel=data.y;
          vec2 texelSize=1./resolution;
          float p_right=texture2D(textureA,uv+vec2(texelSize.x,0.)).x;
          float p_left=texture2D(textureA,uv+vec2(-texelSize.x,0.)).x;
          float p_up=texture2D(textureA,uv+vec2(0.,texelSize.y)).x;
          float p_down=texture2D(textureA,uv+vec2(0.,-texelSize.y)).x;
          pVel+=delta*(-2.*pressure+p_right+p_left)/4.;
          pVel+=delta*(-2.*pressure+p_up+p_down)/4.;
          pressure+=delta*pVel;
          pVel-=.005*delta*pressure;
          pVel*=(1.-.002*delta);
          pressure*=.999;
          vec2 mouseUV=mouse/resolution;
          if(mouse.x>0.){
            float dist=distance(uv,mouseUV);
            if(dist<=.02){pressure+=2.*(1.-dist/.02);}
          }
          gl_FragColor=vec4(pressure,pVel,(p_right-p_left)/2.,(p_up-p_down)/2.);
        }`
    });

    const renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D textureA;
        uniform sampler2D textureB;
        varying vec2 vUv;
        void main(){
          vec4 data=texture2D(textureA,vUv);
          vec2 slope=data.zw;
          vec2 distortion=0.3*slope;
          vec4 color=texture2D(textureB,vUv+distortion);
          
          // Specular highlight for water surface
          float highlight = max(0.0, slope.x * 2.5 + slope.y * 2.5);
          color.rgb += highlight * 0.8; 
          
          gl_FragColor=color;
        }`
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const simQuad = new THREE.Mesh(plane, simMaterial);
    const renderQuad = new THREE.Mesh(plane, renderMaterial);
    simScene.add(simQuad);
    scene.add(renderQuad);

    // --- Canvas Texture ---
    const backgroundCanvas = document.createElement("canvas");
    let backgroundTexture = new THREE.CanvasTexture(backgroundCanvas);
    backgroundTexture.minFilter = THREE.LinearFilter;
    backgroundTexture.magFilter = THREE.LinearFilter;

    const drawBackground = () => {
      const currentDpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
      const newWidth = window.innerWidth * currentDpr;
      const newHeight = window.innerHeight * currentDpr;
      backgroundCanvas.width = newWidth;
      backgroundCanvas.height = newHeight;

      const ctx = backgroundCanvas.getContext("2d");
      if (!ctx) return;

      // Base Gradient (Richer Sea theme for Sri Lanka coast, semi-transparent to show map underneath)
      const gradient = ctx.createRadialGradient(newWidth/2, newHeight/2, 0, newWidth/2, newHeight/2, Math.max(newWidth,newHeight)*0.8);
      gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');    // Bright cyan (shallow waters near the island)
      gradient.addColorStop(0.2, 'rgba(2, 132, 199, 0.6)');   // Rich coastal blue
      gradient.addColorStop(0.5, 'rgba(3, 105, 161, 0.8)');   // Mid sea blue
      gradient.addColorStop(0.8, 'rgba(7, 89, 133, 0.9)');    // Deeper ocean
      gradient.addColorStop(1, 'rgba(8, 47, 73, 0.95)');      // Very dark navy at the edges
      ctx.fillStyle = gradient;
      ctx.fillRect(0,0,newWidth,newHeight);

      // Grid (Very faint, almost invisible to look more organic)
      let gridSize = isMobile ? 25 * currentDpr : 40 * currentDpr;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      for(let x=0;x<newWidth;x+=gridSize){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,newHeight); ctx.stroke(); }
      for(let y=0;y<newHeight;y+=gridSize){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(newWidth,y); ctx.stroke(); }

      // Draw Elements
      elements.forEach(el=>{
        if(el.type==='text'){
          const fontSize = (el.fontSize||150)*currentDpr * (isMobile ? 0.6 : 1);
          ctx.font = `${el.fontWeight||'bold'} ${fontSize}px '${el.fontFamily||'Montserrat'}', sans-serif`;
          ctx.fillStyle = el.color||'rgba(255,255,255,0.7)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          if(isMobile){
            // Split each word into its own line
            const words = el.content.split(' ');
            const lineHeight = fontSize * 1.2;
            words.forEach((word,index)=>{
              ctx.fillText(word, el.x*newWidth, el.y*newHeight + index*lineHeight);
            });
          } else {
            ctx.fillText(el.content, el.x*newWidth, el.y*newHeight);
          }
        } else if(el.type==='image' && el.img){
          const imgWidth = (el.width||100)*currentDpr;
          const imgHeight = (el.height||100)*currentDpr;
          const xPos = el.x*newWidth - imgWidth/2;
          const yPos = el.y*newHeight - imgHeight/2;
          ctx.save();
          ctx.globalAlpha = el.opacity||1;
          ctx.drawImage(el.img,xPos,yPos,imgWidth,imgHeight);
          ctx.restore();
        }
      });

      backgroundTexture.needsUpdate = true;
    };

    drawBackground();

    // --- Event Handlers ---
    const handleResize = () => {
      isMobile = window.innerWidth < 768;
      const currentDpr = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(currentDpr);
      renderer.setSize(window.innerWidth, window.innerHeight);
      const newWidth = window.innerWidth * currentDpr;
      const newHeight = window.innerHeight * currentDpr;
      rtA.setSize(newWidth, newHeight);
      rtB.setSize(newWidth, newHeight);
      simMaterial.uniforms.resolution.value.set(newWidth,newHeight);
      drawBackground();
    };

    const handlePointerMove = (e: MouseEvent|TouchEvent) => {
      let clientX, clientY;
      if('touches' in e){
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const currentDpr = renderer.getPixelRatio();
      mouse.x = clientX * currentDpr;
      mouse.y = (window.innerHeight - clientY) * currentDpr;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchstart', handlePointerMove);

    let animationFrameId: number;
    const animate = () => {
      simMaterial.uniforms.frame.value = frame++;
      simMaterial.uniforms.textureA.value = rtA.texture;
      renderer.setRenderTarget(rtB);
      renderer.render(simScene,camera);

      renderMaterial.uniforms.textureA.value = rtB.texture;
      renderMaterial.uniforms.textureB.value = backgroundTexture;
      renderer.setRenderTarget(null);
      renderer.render(scene,camera);

      [rtA, rtB] = [rtB, rtA];
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchstart', handlePointerMove);

      renderer.dispose();
      plane.dispose();
      simMaterial.dispose();
      renderMaterial.dispose();
      backgroundTexture.dispose();
      rtA.dispose();
      rtB.dispose();
    };
  }, [elements]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ position: 'fixed', top:0, left:0, zIndex:-1, width:'100vw', height:'100vh' }} 
    />
  );
};

export default RippleBackground;
