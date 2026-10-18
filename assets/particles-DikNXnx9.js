import{i as e,n as t,r as n,t as r}from"./index-Clz7lCAS.js";var i=e(n(),1),a={circle:0,square:1,ring:2,sparkle:3},o={parallax:0,repel:1,attract:2},s={none:0,up:1,down:2,forward:3},c=2400,l=4,u=10,d=1/Math.tan(7.5*Math.PI/180),f=.1,p=100,m=1.8,h=1.5,g=520,ee=46,_=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec3 aPosition;
layout(location = 2) in vec4 aRandom;
layout(location = 3) in vec3 aColor;
uniform mat3 uRotation;
uniform vec3 uOffset;
uniform float uSpread;
uniform float uTime;
uniform float uCamera;
uniform float uAspect;
uniform vec2 uView;
uniform float uRatio;
uniform float uSize;
uniform float uMaxExtent;
uniform float uRandomness;
uniform float uBlur;
uniform float uFocus;
uniform float uGlow;
uniform float uTwinkle;
uniform int uShape;
uniform int uDrift;
uniform float uTravel;
uniform vec4 uPointer;
uniform int uEffect;
uniform float uStrength;
uniform vec4 uBursts[${l}];
uniform int uBurstCount;
uniform float uReveal;
out vec2 vLocal;
out float vRadius;
out float vBlur;
out float vAlpha;
out float vHalo;
out float vSeed;
out vec3 vColor;

vec3 bob(vec4 r, float t) {
  return vec3(
    sin(t * r.z + 6.28 * r.w) * mix(0.1, 1.5, r.x),
    sin(t * r.y + 6.28 * r.x) * mix(0.1, 1.5, r.w),
    sin(t * r.w + 6.28 * r.y) * mix(0.1, 1.5, r.z)
  );
}

void main() {
  vec3 pos = aPosition * uSpread;
  pos.z *= ${u.toFixed(1)};
  vec3 wobble = bob(aRandom, uTime);
  vec3 world = uRotation * pos + uOffset + wobble;
  float edge = 1.0;
  if (uDrift == 1 || uDrift == 2) {
    float span = uSpread * 2.0 + 3.0;
    float k = mod(aRandom.w * span + uOffset.y + wobble.y + (uDrift == 1 ? uTravel : -uTravel), span);
    world.y = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.12, k) * (1.0 - smoothstep(span * 0.88, span, k));
  } else if (uDrift == 3) {
    float span = uSpread * ${u.toFixed(1)} * 2.0 + 3.0;
    float k = mod(aRandom.y * span + uOffset.z + wobble.z + uTravel, span);
    world.z = k - span * 0.5;
    edge = smoothstep(0.0, span * 0.1, k);
  }
  vec3 view = world - vec3(0.0, 0.0, uCamera);
  float dist = length(view);
  float ahead = -view.z;
  if (ahead < ${f.toFixed(2)} || ahead > ${p.toFixed(1)}) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  edge *= smoothstep(1.0, 4.0, ahead);
  vec2 ndc = vec2(view.x * ${d.toFixed(6)} / uAspect, view.y * ${d.toFixed(6)}) / ahead;
  vec2 screen = (ndc * 0.5 + 0.5) * uView;

  vec2 shift = vec2(0.0);
  float flash = 0.0;
  if (uEffect != 0 && uPointer.z > 0.001) {
    vec2 delta = screen - uPointer.xy;
    float reach = length(delta);
    float falloff = exp(-dot(delta, delta) / (uPointer.w * uPointer.w));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    shift += (uEffect == 1 ? away * uPointer.w * 0.5 : -delta * 0.6) * falloff * uStrength * uPointer.z;
  }
  for (int i = 0; i < ${l}; i++) {
    if (i >= uBurstCount) break;
    vec4 burst = uBursts[i];
    vec2 delta = screen - burst.xy;
    float reach = length(delta);
    float wave = exp(-pow((reach - burst.z * ${g.toFixed(1)}) / ${ee.toFixed(1)}, 2.0));
    vec2 away = reach > 0.001 ? delta / reach : vec2(0.0);
    float fade = (1.0 - burst.z) * (1.0 - burst.z) * burst.w;
    shift += away * wave * fade * 56.0 * smoothstep(0.0, 30.0, reach);
    flash += wave * fade;
  }
  screen += shift;

  float diameter = (uRandomness <= 0.0 ? uSize : uSize * (1.0 + uRandomness * (aRandom.x - 0.5)) / dist) * (1.0 + min(flash, 1.0) * 0.6);
  float device = diameter * uRatio;
  float radius = max(diameter, 1.0 / uRatio) * 0.5;
  float coverage = min(1.0, device * device);
  float blur = uBlur * max(uFocus - dist, 0.0) / max(dist, 1.0);
  float halo = uGlow > 0.0 ? radius * 2.5 + 2.0 : 0.0;
  float extent = radius * (uShape == 3 ? 1.6 : 1.0) + blur + halo + 1.5;
  // Near-camera particles and fixed-size particles can otherwise create very
  // large transparent quads. Scale the entire shape/halo together, without
  // clipping a ring or sparkle at the sprite boundary.
  float extentScale = min(1.0, uMaxExtent / max(extent, 1.0));
  radius *= extentScale;
  blur *= extentScale;
  halo *= extentScale;
  extent *= extentScale;

  float twinkle = 1.0 - uTwinkle * 0.6 * (0.5 + 0.5 * sin(uTime * (6.0 + aRandom.y * 14.0) + aRandom.w * 40.0));
  float far = (1.0 - smoothstep(${(p*.9).toFixed(1)}, ${p.toFixed(1)}, ahead));
  float focus = radius / (radius + blur);
  float reveal = clamp(uReveal * 1.6 - aRandom.z * 0.6, 0.0, 1.0);

  vLocal = aCorner * extent;
  vRadius = radius;
  vBlur = blur;
  vHalo = halo;
  vSeed = aRandom.y;
  vAlpha = min(1.0, coverage * twinkle * (1.0 + flash * 1.4)) * far * edge * max(focus, 0.35) * reveal * reveal;
  vColor = aColor;
  gl_Position = vec4((screen + aCorner * extent) / uView * 2.0 - 1.0, 0.0, 1.0);
}`,v=`#version 300 es
precision highp float;
precision highp int;
uniform int uShape;
uniform float uGlow;
uniform float uRatio;
uniform float uTime;
uniform float uSoft;
uniform float uShimmer;
uniform float uOpacity;
in vec2 vLocal;
in float vRadius;
in float vBlur;
in float vAlpha;
in float vHalo;
in float vSeed;
in vec3 vColor;
out vec4 outColor;

float ray(vec2 q, float aa) {
  float width = 0.14 * max(0.0, 1.0 - q.x);
  return (1.0 - smoothstep(width - aa, width + aa, q.y)) * step(q.x, 1.0);
}

void main() {
  float soft = vBlur + 0.7 / uRatio + vRadius * uSoft;
  float d = length(vLocal);
  float shape;
  if (uShape == 1) {
    float box = max(abs(vLocal.x), abs(vLocal.y));
    shape = 1.0 - smoothstep(vRadius * 0.86 - soft, vRadius * 0.86 + soft, box);
  } else if (uShape == 2) {
    float edge = max(vRadius * 0.22, 0.6 / uRatio);
    shape = 1.0 - smoothstep(edge - soft, edge + soft, abs(d - vRadius * 0.8));
  } else if (uShape == 3) {
    float reach = vRadius * 1.6;
    vec2 q = abs(vLocal) / max(reach, 0.0001);
    float aa = soft / max(reach, 0.0001);
    shape = max(max(ray(q, aa), ray(q.yx, aa)), 1.0 - smoothstep(vRadius * 0.32 - soft, vRadius * 0.32 + soft, d));
  } else {
    shape = 1.0 - smoothstep(vRadius - soft, vRadius + soft, d);
  }
  float halo = vHalo > 0.0 ? exp(-d / (vHalo * 0.35)) * uGlow * 0.4 : 0.0;
  float alpha = clamp(shape + halo * (1.0 - shape), 0.0, 1.0) * vAlpha * uOpacity * (1.0 - uSoft);
  if (alpha < 0.002) discard;
  vec2 uv = vLocal / max(vRadius * 2.0, 0.0001) + 0.5;
  vec3 color = clamp(vColor + uShimmer * 0.2 * sin(uv.yxx + uTime + vSeed * 6.28), 0.0, 1.0);
  outColor = vec4(color * alpha, alpha);
}`,y=`#version 300 es
precision highp float;
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aEnds;
layout(location = 2) in vec4 aTint;
uniform vec2 uView;
uniform float uRatio;
uniform float uWidth;
out float vAcross;
out float vHalf;
out vec4 vTint;

void main() {
  vec2 a = aEnds.xy;
  vec2 b = aEnds.zw;
  vec2 along = b - a;
  float span = max(length(along), 0.0001);
  vec2 normal = vec2(-along.y, along.x) / span;
  float reach = uWidth * 0.5 + 1.0 / uRatio;
  vec2 point = mix(a, b, aCorner.x * 0.5 + 0.5) + normal * aCorner.y * reach;
  vAcross = aCorner.y * reach;
  vHalf = uWidth * 0.5;
  vTint = aTint;
  gl_Position = vec4(point / uView * 2.0 - 1.0, 0.0, 1.0);
}`,b=`#version 300 es
precision highp float;
uniform float uRatio;
uniform float uOpacity;
in float vAcross;
in float vHalf;
in vec4 vTint;
out vec4 outColor;

void main() {
  float edge = 0.6 / uRatio;
  float cover = 1.0 - smoothstep(vHalf - edge, vHalf + edge, abs(vAcross));
  float alpha = cover * vTint.a * uOpacity;
  outColor = vec4(vTint.rgb * alpha, alpha);
}`,x=(e,t,n)=>Math.min(n,Math.max(t,e)),S=e=>1-(1-x(e,0,1))**3,te=(e,t)=>(e%t+t)%t;function C(e){let t=r(e.settings);return{count:t.particleCount,spread:t.particleSpread,speed:t.speed,colors:[t.color1,t.color2,t.color3],mouse:t.moveParticlesOnHover,hoverFactor:t.particleHoverFactor,soft:t.alphaParticles,size:t.particleBaseSize,randomness:t.sizeRandomness,camera:t.cameraDistance,rotate:!t.disableRotation,shape:a[t.shape],glow:t.glow,twinkle:t.twinkle,depthOfField:t.depthOfField,connections:t.connections,connectionDistance:t.connectionDistance,hoverEffect:o[t.hoverEffect],hoverRadius:t.hoverRadius,clickBurst:t.clickBurst,drift:s[t.drift],driftSpeed:t.driftSpeed,variation:t.variation,intro:t.intro,opacity:t.opacity,lightMode:e.lightMode,animated:e.animated}}function w(e,t,n,r,i){let a=e<=760||r,o=Math.max(1,e)*Math.max(1,t),s=Math.min(Math.max(.1,n||1),a?1:1.5,Math.sqrt((a?8e5:25e5)/o)),l=Math.min(a?112:160,Math.max(24,Math.min(e,t)*.3)),u=Math.max(8e4,Math.min(a?3e6:2e7,o*s*s*(a?6:10))),d=a?600:2400;if(i){let e=(i.sizeRandomness===0?i.particleBaseSize:i.particleBaseSize*1.5/Math.max(8,i.cameraDistance))*.5,t=i.glow>0?e*2.5+2:0,n=Math.min(l,e*(i.shape===`sparkle`?1.6:1)+i.depthOfField*14+t+1.5),r=4*n*n*s*s;d=Math.min(d,Math.max(1,Math.floor(u/Math.max(1,r))))}return{count:d,linked:a?240:600,lines:a?800:c,ratio:s,maxExtent:l,fillPixels:u}}function T(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function E(e,t){let n=[1,3,5].map(t=>parseInt(e.slice(t,t+2),16)/255);if(!t)return n;let r=n.map(e=>e**2.2),i=.2126*r[0]+.7152*r[1]+.0722*r[2],a=Math.min(1,.06/Math.max(i,1e-4));return r.map(e=>(e*a)**(1/2.2))}function ne(e,t,n,r){let i=x(Math.round(e),1,2400),a=T(t*7919+1),o=new Float32Array(i*3),s=new Float32Array(i*4),c=new Float32Array(i*3),l=n.map(e=>E(e,r));for(let e=0;e<i;e++){let t,n,r,i;do t=a()*2-1,n=a()*2-1,r=a()*2-1,i=t*t+n*n+r*r;while(i>1||i===0);let u=Math.cbrt(a());o.set([t*u,n*u,r*u],e*3),s.set([a(),a(),a(),a()],e*4),c.set(l[Math.floor(a()*l.length)],e*3)}return{count:i,positions:o,randoms:s,colors:c}}function D(e,t,n){let r=e.createShader(t);if(!r)throw Error(`Particle shader allocation failed`);try{if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw Error(`Particle shader compilation failed`);return r}catch(t){throw e.deleteShader(r),t}}function O(e,t,n){let r,i,a=null;try{if(r=D(e,e.VERTEX_SHADER,t),i=D(e,e.FRAGMENT_SHADER,n),a=e.createProgram(),!a)throw Error(`Particle program allocation failed`);if(e.attachShader(a,r),e.attachShader(a,i),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw Error(`Particle program linking failed`);let o={},s=e.getProgramParameter(a,e.ACTIVE_UNIFORMS);for(let t=0;t<s;t++){let n=e.getActiveUniform(a,t);n&&(o[n.name.replace(`[0]`,``)]=e.getUniformLocation(a,n.name))}return{program:a,uniforms:o}}catch(t){throw a&&e.deleteProgram(a),t}finally{r&&e.deleteShader(r),i&&e.deleteShader(i)}}function k(e){let t=[],n=[],r=[],i=()=>{for(let n of t.splice(0))e.deleteProgram(n);for(let t of n.splice(0))e.deleteBuffer(t);for(let t of r.splice(0))e.deleteVertexArray(t)},a=()=>{let t=e.createBuffer();if(!t)throw Error(`Particle buffer allocation failed`);return n.push(t),t},o=()=>{let t=e.createVertexArray();if(!t)throw Error(`Particle array allocation failed`);return r.push(t),t};try{let n=O(e,_,v);t.push(n.program);let r=O(e,y,b);t.push(r.program);let s=a();e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);let l=a(),u=a(),d=a(),f=o();e.bindVertexArray(f),e.bindBuffer(e.ARRAY_BUFFER,s),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let p=(t,n,r)=>{e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(n),e.vertexAttribPointer(n,r,e.FLOAT,!1,0,0),e.vertexAttribDivisor(n,1)};p(l,1,3),p(u,2,4),p(d,3,3);let m=a(),h=o();return e.bindVertexArray(h),e.bindBuffer(e.ARRAY_BUFFER,s),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,m),e.bufferData(e.ARRAY_BUFFER,c*8*4,e.DYNAMIC_DRAW),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,4,e.FLOAT,!1,32,0),e.vertexAttribDivisor(1,1),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,4,e.FLOAT,!1,32,16),e.vertexAttribDivisor(2,1),e.bindVertexArray(null),{dots:n,lines:r,dotVao:f,lineVao:h,positionBuffer:l,randomBuffer:u,colorBuffer:d,lineBuffer:m,release:i}}catch(e){throw i(),e}}function A(e,t,n){let r=C(n),i=!1,o=!1,s=!1,_=null,v,y=0,b=0,T=0,E=!0,D=!1,O=!1,A=0,j,M=``,N=null,P=e.closest(`.theme-preview-canvas, .portfolio`)||e.parentElement||e,F=window.matchMedia(`(prefers-reduced-motion: reduce)`),I=window.matchMedia(`(hover: hover) and (pointer: fine)`),L=navigator,R=!!L.connection?.saveData||L.deviceMemory!==void 0&&L.deviceMemory<=4||L.hardwareConcurrency>0&&L.hardwareConcurrency<=4,z=w(1,1,1,R),re=(e,t)=>w(e,t,window.devicePixelRatio||1,R,{particleBaseSize:r.size,sizeRandomness:r.randomness,glow:r.glow,shape:Object.keys(a)[r.shape],depthOfField:r.depthOfField,cameraDistance:r.camera}),B={width:1,height:1,ratio:1},V={x:0,y:0,sx:0,sy:0,nx:0,ny:0,inside:!1,active:0},H={clock:0,spin:0,travel:0,offsetX:0,offsetY:0,reveal:r.intro&&r.animated&&!F.matches?0:1},U=[],ie=new Float32Array(l*4),W=new Float32Array(c*8),G={key:``,count:0,positions:new Float32Array,randoms:new Float32Array,colors:new Float32Array},K={x:new Float32Array,y:new Float32Array,ahead:new Float32Array,alpha:new Float32Array},ae=()=>!i&&!o&&!!_&&O&&E&&!D&&!document.hidden,q=()=>ae()&&r.animated&&!F.matches,oe=()=>{y&&cancelAnimationFrame(y),y=0,b=0,T=0},J=()=>{oe(),o=!0,e.dataset.renderer=`fallback`,e.dataset.motion=`static`},se=t=>{if(!_)return;let n=Math.min(t.count,z.count),r=`${n}|${z.linked}|${t.variation}|${t.colors.join(`,`)}|${t.lightMode}`;if(G.key===r)return;Object.assign(G,ne(n,t.variation,t.colors,t.lightMode),{key:r});let i=Math.min(n,z.linked);K.x=new Float32Array(i),K.y=new Float32Array(i),K.ahead=new Float32Array(i),K.alpha=new Float32Array(i),v.bindBuffer(v.ARRAY_BUFFER,_.positionBuffer),v.bufferData(v.ARRAY_BUFFER,G.positions,v.STATIC_DRAW),v.bindBuffer(v.ARRAY_BUFFER,_.randomBuffer),v.bufferData(v.ARRAY_BUFFER,G.randoms,v.STATIC_DRAW),v.bindBuffer(v.ARRAY_BUFFER,_.colorBuffer),v.bufferData(v.ARRAY_BUFFER,G.colors,v.STATIC_DRAW),e.dataset.particleCount=String(n)},ce=e=>{let t=H.clock*1e3,n=e.rotate?Math.sin(t*2e-4)*.1:0,r=e.rotate?Math.cos(t*5e-4)*.15:0,i=e.rotate?H.spin:0,[a,o,s,c,l,u]=[Math.sin(n),Math.cos(n),Math.sin(r),Math.cos(r),Math.sin(i),Math.cos(i)];return[c*u+s*a*l,o*l,-s*u+c*a*l,-c*l+s*a*u,o*u,s*l+c*a*u,s*o,-a,c*o]},le=()=>[H.offsetX,H.offsetY,-(1-S(H.reveal))*70],ue=(e,t)=>{let n=Math.min(G.count,z.linked),[r,i,a]=le(),o=B.width/B.height,s=H.clock,c=e.hoverRadius,l=e.hoverEffect===0?0:V.active,m=e.spread*2+3,_=e.spread*u*2+3;for(let v=0;v<n;v++){let n=G.positions[v*3]*e.spread,y=G.positions[v*3+1]*e.spread,b=G.positions[v*3+2]*e.spread*u,S=G.randoms[v*4],C=G.randoms[v*4+1],w=G.randoms[v*4+2],T=G.randoms[v*4+3],E=Math.sin(s*w+6.28*T)*(.1+1.4*S),ne=Math.sin(s*C+6.28*S)*(.1+1.4*T),D=Math.sin(s*T+6.28*C)*(.1+1.4*w),O=t[0]*n+t[3]*y+t[6]*b+r+E,k=t[1]*n+t[4]*y+t[7]*b+i+ne,A=t[2]*n+t[5]*y+t[8]*b+a+D,j=1;if(e.drift===1||e.drift===2){let t=te(T*m+i+ne+(e.drift===1?H.travel:-H.travel),m);k=t-m/2;let n=x(t/(m*.12),0,1),r=x((m-t)/(m*.12),0,1);j=n*n*(3-2*n)*r*r*(3-2*r)}else if(e.drift===3){let e=te(C*_+a+D+H.travel,_);A=e-_/2;let t=x(e/(_*.1),0,1);j=t*t*(3-2*t)}let M=e.camera-A;if(M<f||M>p){K.alpha[v]=0;continue}let N=x((M-1)/3,0,1);j*=N*N*(3-2*N);let P=O*d/o/M*.5*B.width+B.width/2,F=k*d/M*.5*B.height+B.height/2,I=0,L=0;if(l>.001){let t=P-V.sx,n=F-V.sy,r=Math.hypot(t,n),i=Math.exp(-(t*t+n*n)/(c*c))*e.hoverFactor*l;e.hoverEffect===1&&r>.001?(I+=t/r*c*.5*i,L+=n/r*c*.5*i):e.hoverEffect===2&&(I-=t*.6*i,L-=n*.6*i)}for(let e of U){let t=e.age/h,n=P-e.x,r=F-e.y,i=Math.hypot(n,r);if(i<.001)continue;let a=Math.exp(-(((i-t*g)/ee)**2)),o=x(i/30,0,1),s=a*(1-t)*(1-t)*56*o*o*(3-2*o);I+=n/i*s,L+=r/i*s}P+=I,F+=L;let R=x((p-M)/(p-p*.9),0,1),z=x(H.reveal*1.6-w*.6,0,1);K.x[v]=P,K.y[v]=F,K.ahead[v]=M,K.alpha[v]=R*R*(3-2*R)*j*z*z}return n},de=(e,t)=>{let n=ue(e,t),r=e.connectionDistance,i=Math.max(1,Math.ceil(B.width/r)+2),a=new Map;for(let e=0;e<n;e++){if(K.alpha[e]<.02||K.x[e]<-r||K.x[e]>B.width+r||K.y[e]<-r||K.y[e]>B.height+r)continue;let t=(Math.floor(K.y[e]/r)+1)*i+Math.floor(K.x[e]/r)+1,n=a.get(t);n?n.push(e):a.set(t,[e])}let o=0,s=r*r;for(let[e,t]of a)for(let n of[0,1,i-1,i,i+1]){let i=n===0?t:a.get(e+n);if(i)for(let e=0;e<t.length;e++){let a=t[e];for(let t=n===0?e+1:0;t<i.length;t++){let e=i[t],n=K.x[a]-K.x[e],c=K.y[a]-K.y[e],l=n*n+c*c;if(l>s)continue;let u=x(1-Math.abs(K.ahead[a]-K.ahead[e])/18,0,1);if(u<=0)continue;if(o>=z.lines)return o;let d=1-Math.sqrt(l)/r,f=o*8;W[f]=K.x[a],W[f+1]=K.y[a],W[f+2]=K.x[e],W[f+3]=K.y[e],W[f+4]=(G.colors[a*3]+G.colors[e*3])/2,W[f+5]=(G.colors[a*3+1]+G.colors[e*3+1])/2,W[f+6]=(G.colors[a*3+2]+G.colors[e*3+2])/2,W[f+7]=d*d*u*.7*Math.min(K.alpha[a],K.alpha[e]),o++}}}return o},fe=()=>{let n=r;if(!ae()||!_)return;let{dots:i,lines:a,dotVao:o,lineVao:s,lineBuffer:c}=_;se(n);let u=ce(n),[d,f,p]=le();if(v.viewport(0,0,t.width,t.height),v.clearColor(0,0,0,0),v.clear(v.COLOR_BUFFER_BIT),v.enable(v.BLEND),v.blendFunc(v.ONE,v.ONE_MINUS_SRC_ALPHA),n.connections){let e=de(n,u);e&&(v.useProgram(a.program),v.bindVertexArray(s),v.bindBuffer(v.ARRAY_BUFFER,c),v.bufferSubData(v.ARRAY_BUFFER,0,W.subarray(0,e*8)),v.uniform2f(a.uniforms.uView,B.width,B.height),v.uniform1f(a.uniforms.uRatio,B.ratio),v.uniform1f(a.uniforms.uWidth,1),v.uniform1f(a.uniforms.uOpacity,n.opacity),v.drawArraysInstanced(v.TRIANGLE_STRIP,0,4,e))}let m=i.uniforms,g=0;for(let e=U.length-1;e>=0&&g<l;e--)ie.set([U[e].x,U[e].y,U[e].age/h,1],g*4),g++;v.useProgram(i.program),v.bindVertexArray(o),v.uniformMatrix3fv(m.uRotation,!1,u),v.uniform3f(m.uOffset,d,f,p),v.uniform1f(m.uSpread,n.spread),v.uniform1f(m.uTime,H.clock),v.uniform1f(m.uCamera,n.camera),v.uniform1f(m.uAspect,B.width/B.height),v.uniform2f(m.uView,B.width,B.height),v.uniform1f(m.uRatio,B.ratio),v.uniform1f(m.uSize,n.size),v.uniform1f(m.uMaxExtent,z.maxExtent),v.uniform1f(m.uRandomness,n.randomness),v.uniform1f(m.uBlur,n.depthOfField*14),v.uniform1f(m.uFocus,n.camera+14),v.uniform1f(m.uGlow,n.lightMode?n.glow*.3:n.glow),v.uniform1f(m.uTwinkle,n.twinkle),v.uniform1i(m.uShape,n.shape),v.uniform1i(m.uDrift,n.drift),v.uniform1f(m.uTravel,H.travel),v.uniform4f(m.uPointer,V.sx,V.sy,V.active,n.hoverRadius),v.uniform1i(m.uEffect,n.hoverEffect),v.uniform1f(m.uStrength,n.hoverFactor),v.uniform4fv(m.uBursts,ie),v.uniform1i(m.uBurstCount,g),v.uniform1f(m.uReveal,H.reveal),v.uniform1f(m.uSoft,n.soft?.2:0),v.uniform1f(m.uShimmer,+!n.lightMode),v.uniform1f(m.uOpacity,n.opacity),v.drawArraysInstanced(v.TRIANGLE_STRIP,0,4,G.count),v.bindVertexArray(null),e.dataset.renderer=`webgl`},pe=()=>{try{fe()}catch{_?.release(),_=null,J()}},me=e=>{if(y=0,!q())return;let t=1e3/30;if(!b||e-b>=t-.5){let n=T?x((e-T)/1e3,5e-4,.1):1/30;T=e,b=b?b+Math.floor((e-b+.5)/t)*t:e;let i=r,a=n*i.speed;H.clock+=a,i.rotate&&(H.spin+=a*.6),H.travel+=n*i.driftSpeed*(i.drift===3?6:.9);let o=i.mouse&&V.inside&&I.matches,s=1-Math.exp(-n/.35),c=o&&i.hoverEffect===0?i.hoverFactor:0;H.offsetX+=(-V.nx*c-H.offsetX)*s,H.offsetY+=(-V.ny*c-H.offsetY)*s,V.sx+=(V.x-V.sx)*(1-Math.exp(-n/.06)),V.sy+=(V.y-V.sy)*(1-Math.exp(-n/.06)),V.active+=(+!!o-V.active)*(1-Math.exp(-n/.2));for(let e=U.length-1;e>=0;e--)U[e].age+=n,U[e].age>=h&&U.splice(e,1);i.intro?H.reveal<1&&(H.reveal=Math.min(1,H.reveal+n/m)):H.reveal=1,pe()}q()&&(y=requestAnimationFrame(me))},Y=(t=!1)=>{if(i)return;let n=q();e.dataset.motion=ae()?n?`running`:`static`:`suspended`,n?(t&&pe(),y||=requestAnimationFrame(me)):(oe(),(!r.animated||F.matches)&&(H.reveal=1,H.offsetX=0,H.offsetY=0,V.active=0,V.inside=!1,U.length=0),pe())},X=()=>{if(i)return;N=e.getBoundingClientRect();let{width:n,height:r}=N;if(O=n>0&&r>0,O){z=re(n,r);let e=Math.max(1,Math.round(n*z.ratio)),i=Math.max(1,Math.round(r*z.ratio)),a=`${e}:${i}`;a!==M&&(M=a,t.width=e,t.height=i),B.width=n,B.height=r,B.ratio=e/n}Y(!0)},he=t=>{let n=N||=e.getBoundingClientRect(),r=t.clientX-n.left,i=t.clientY-n.top,a=V.inside;V.inside=r>=0&&i>=0&&r<=n.width&&i<=n.height,V.x=r,V.y=n.height-i,V.nx=r/Math.max(1,n.width)*2-1,V.ny=-(i/Math.max(1,n.height)*2-1),V.inside&&!a&&(V.sx=V.x,V.sy=V.y)},ge=e=>{!q()||!I.matches||!r.mouse||e.pointerType!==`mouse`||he(e)},_e=e=>{!q()||!I.matches||!r.clickBurst||e.pointerType!==`mouse`||e.button!==0||e.target?.closest(`button,a,input,textarea,select,[role="button"],[role="dialog"]`)||(he(e),V.inside&&(U.push({x:V.x,y:V.y,age:0}),U.length>l&&U.shift()))},Z=()=>{V.inside=!1},ve=()=>{N=null},ye=()=>{T=0,b=0,Y(!0)},Q=()=>{V.inside=!1,Y(!0)},be=()=>{D=!!e.closest(`[data-aria-hidden="true"], [inert]`),Y(!0)},xe=e=>{e.preventDefault(),_?.release(),_=null,G.key=``,J()},$=()=>{if(!i)try{let e=t.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`});if(!e){J();return}v=e,_=k(v),G.key=``,o=!1,s=!0,be(),X()}catch{_?.release(),_=null,J()}},Se=()=>{i||$()},Ce=new ResizeObserver(X),we=new IntersectionObserver(([e])=>{E=e.isIntersecting,Y(!0)}),Te=new MutationObserver(be);Ce.observe(e),we.observe(e);for(let t=e.parentElement;t;t=t.parentElement)Te.observe(t,{attributes:!0,attributeFilter:[`data-aria-hidden`,`inert`]});return P.addEventListener(`pointermove`,ge,{passive:!0}),P.addEventListener(`pointerdown`,_e,{passive:!0}),P.addEventListener(`pointerleave`,Z,{passive:!0}),P.addEventListener(`pointercancel`,Z,{passive:!0}),document.addEventListener(`scroll`,ve,{passive:!0,capture:!0}),window.addEventListener(`resize`,X,{passive:!0}),document.addEventListener(`visibilitychange`,ye),F.addEventListener(`change`,Q),I.addEventListener(`change`,Q),t.addEventListener(`webglcontextlost`,xe),t.addEventListener(`webglcontextrestored`,Se),e.dataset.renderer=`fallback`,window.requestIdleCallback?A=window.requestIdleCallback(()=>{A=0,$()},{timeout:1200}):j=setTimeout(()=>{j=void 0,$()},40),{update(e){r=C(e),z=re(B.width,B.height),r.intro||(H.reveal=1),s&&Y(!0)},dispose(){if(!i){i=!0,oe(),A&&window.cancelIdleCallback&&window.cancelIdleCallback(A),clearTimeout(j),Ce.disconnect(),we.disconnect(),Te.disconnect(),P.removeEventListener(`pointermove`,ge),P.removeEventListener(`pointerdown`,_e),P.removeEventListener(`pointerleave`,Z),P.removeEventListener(`pointercancel`,Z),document.removeEventListener(`scroll`,ve,!0),window.removeEventListener(`resize`,X),document.removeEventListener(`visibilitychange`,ye),F.removeEventListener(`change`,Q),I.removeEventListener(`change`,Q),t.removeEventListener(`webglcontextlost`,xe),t.removeEventListener(`webglcontextrestored`,Se),_?.release(),_=null;try{v?.getExtension(`WEBGL_lose_context`)?.loseContext()}catch{}delete e.dataset.renderer,delete e.dataset.motion,delete e.dataset.particleCount}}}}var j=t();function M({settings:e,animated:t=!0,lightMode:n=!1}){let a=r(e),o=(0,i.useRef)(null),s=(0,i.useRef)(null),c=(0,i.useRef)({settings:a,animated:t,lightMode:n});return(0,i.useEffect)(()=>{c.current={settings:a,animated:t,lightMode:n}}),(0,i.useEffect)(()=>{let e=o.current;if(!e)return;let t=document.createElement(`canvas`);t.className=`particles-canvas`,t.setAttribute(`aria-hidden`,`true`),e.appendChild(t);let n=A(e,t,c.current);return s.current=n,()=>{n.dispose(),t.remove(),s.current=null}},[]),(0,i.useEffect)(()=>{s.current?.update(c.current)}),(0,j.jsx)(`div`,{ref:o,className:`particles-container`,style:{"--particles-color-1":a.color1,"--particles-color-2":a.color2,"--particles-color-3":a.color3,"--particles-background":a.backgroundColor,"--particles-opacity":a.opacity},"data-light-mode":n,"aria-hidden":`true`})}export{M as default};