/**
 * AL HABIB RESTAURANT (الحبیب ریستوران) - 3D INTERACTIVE ENGINE
 * Design: High-contrast Dark Luxury with Volumetric Amber/Ember Glow
 * Karachi - Hyderabad Motorway M-9, Gadap Town, Karachi
 */

// ============================================================================
// 1. THREE.JS 3D BACKGROUND SCENE (Embers, Volumetric Light & Charcoal Sparks)
// ============================================================================
class ThreeDBackground {
  constructor() {
    this.canvas = document.getElementById('bg3dCanvas');
    if (!this.canvas) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.position.z = 50;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.initLights();
    this.createEmbers();
    this.create3DWokAura();
    this.bindEvents();
    this.animate();
  }

  initLights() {
    // Ambient warm tone
    const ambientLight = new THREE.AmbientLight(0xff4400, 0.6);
    this.scene.add(ambientLight);

    // Glowing point light mimicking live coals
    this.coalLight = new THREE.PointLight(0xff7700, 2.5, 120);
    this.coalLight.position.set(0, -10, 20);
    this.scene.add(this.coalLight);

    // Upper fiery rim light (referencing Pinterest diagonal amber beam)
    this.beamLight = new THREE.PointLight(0xff5500, 3, 150);
    this.beamLight.position.set(35, 30, 10);
    this.scene.add(this.beamLight);
  }

  createEmbers() {
    const particleCount = 650;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    this.velocities = [];

    const colorChoices = [
      new THREE.Color(0xff4500), // Orange Red
      new THREE.Color(0xff8c00), // Dark Orange
      new THREE.Color(0xffaa00), // Amber Gold
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xff2200)  // Deep Ember
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 2.8 + 1.2;

      this.velocities.push({
        x: (Math.random() - 0.5) * 0.08,
        y: Math.random() * 0.12 + 0.04, // Rising upward like smoke/fire
        z: (Math.random() - 0.5) * 0.05,
        freq: Math.random() * 2 + 1,
        amp: Math.random() * 0.08 + 0.02
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Create a circular glowing particle texture via HTML canvas
    const particleTexture = this.generateParticleTexture();

    const material = new THREE.PointsMaterial({
      size: 2.2,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  generateParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 160, 40, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 60, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  create3DWokAura() {
    // 3D wireframe toroidal wok aura revolving subtly in the background
    const torusGeo = new THREE.TorusGeometry(18, 0.4, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    this.wokRing1 = new THREE.Mesh(torusGeo, torusMat);
    this.wokRing1.position.set(20, -10, -15);
    this.wokRing1.rotation.x = Math.PI / 2.5;
    this.scene.add(this.wokRing1);

    const torusGeo2 = new THREE.TorusGeometry(26, 0.2, 12, 120);
    const torusMat2 = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    this.wokRing2 = new THREE.Mesh(torusGeo2, torusMat2);
    this.wokRing2.position.set(20, -10, -15);
    this.wokRing2.rotation.x = Math.PI / 2.3;
    this.scene.add(this.wokRing2);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 15;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * -15;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Mouse easing
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.camera.position.x = this.mouseX;
    this.camera.position.y = this.mouseY;
    this.camera.lookAt(0, 0, 0);

    // Animate glowing embers rising
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      const count = positions.length / 3;
      const time = performance.now() * 0.001;

      for (let i = 0; i < count; i++) {
        const vel = this.velocities[i];
        
        // Rise up
        positions[i * 3 + 1] += vel.y;
        // Sway horizontally like hot convection currents
        positions[i * 3] += Math.sin(time * vel.freq + i) * vel.amp;

        // Reset if drifted past top
        if (positions[i * 3 + 1] > 45) {
          positions[i * 3 + 1] = -45;
          positions[i * 3] = (Math.random() - 0.5) * 120;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      this.particles.rotation.y += 0.0004;
    }

    // Rotate 3D rings
    if (this.wokRing1 && this.wokRing2) {
      this.wokRing1.rotation.z += 0.002;
      this.wokRing2.rotation.z -= 0.0015;
      
      // Pulse lights
      const t = performance.now() * 0.002;
      this.coalLight.intensity = 2.2 + Math.sin(t * 3) * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================================================
// 2. WEB AUDIO API SYNTHESIZER (Highway Charcoal Grill & Sizzle Ambiance)
// ============================================================================
class HighwayAudioAmbience {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.toggleBtn = document.getElementById('soundToggle');
    this.soundIcon = document.getElementById('soundIcon');
    
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Pink / Brown noise generator for warm charcoal sizzle
    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.035; // Gentle volume
      b6 = white * 0.115926;
    }

    this.whiteNoise = this.audioCtx.createBufferSource();
    this.whiteNoise.buffer = noiseBuffer;
    this.whiteNoise.loop = true;

    // Filter to capture the frying wok sizzle frequencies (1kHz - 4.5kHz)
    this.bandpass = this.audioCtx.createBiquadFilter();
    this.bandpass.type = 'bandpass';
    this.bandpass.frequency.value = 2400;
    this.bandpass.Q.value = 1.2;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);

    this.whiteNoise.connect(this.bandpass);
    this.bandpass.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.whiteNoise.start(0);

    // Occasional crackling coal pop generator
    this.startCoalPops();
  }

  startCoalPops() {
    const playPop = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      const popOsc = this.audioCtx.createOscillator();
      const popGain = this.audioCtx.createGain();
      const popFilter = this.audioCtx.createBiquadFilter();

      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(Math.random() * 300 + 400, this.audioCtx.currentTime);
      popOsc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.08);

      popFilter.type = 'lowpass';
      popFilter.frequency.value = 800;

      popGain.gain.setValueAtTime(Math.random() * 0.05 + 0.02, this.audioCtx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.08);

      popOsc.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(this.audioCtx.destination);

      popOsc.start();
      popOsc.stop(this.audioCtx.currentTime + 0.08);

      const nextPopDelay = Math.random() * 800 + 200;
      setTimeout(playPop, nextPopDelay);
    };

    playPop();
  }

  toggle() {
    if (!this.audioCtx) {
      this.initAudio();
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    if (!this.isPlaying) {
      this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.5);
      this.isPlaying = true;
      this.toggleBtn.classList.add('playing');
      this.soundIcon.setAttribute('data-lucide', 'volume-2');
    } else {
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.4);
      this.isPlaying = false;
      this.toggleBtn.classList.remove('playing');
      this.soundIcon.setAttribute('data-lucide', 'volume-x');
    }
    lucide.createIcons();
  }
}

// ============================================================================
// 3. MENU DATABASE & DYNAMIC RENDERER
// ============================================================================
const MENU_DATA = [
  // Karahi Specials
  {
    id: 'k1',
    category: 'karahi',
    name: 'Special Mutton Shinwari Karahi',
    portion: 'Half / 1 KG Wok',
    price: 2450,
    desc: 'Prepared purely with lamb cuts, lamb fat, green chilies, tomatoes and rock salt in iron wok.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'k2',
    category: 'karahi',
    name: 'Signature Koila Chicken Karahi',
    portion: 'Full Wok (1 KG)',
    price: 1650,
    desc: 'Infused with smoking red-hot charcoal, butter, roasted cumin, and julienned ginger.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'k3',
    category: 'karahi',
    name: 'Desi Ghee White Mutton Karahi',
    portion: 'Half / 1 KG Wok',
    price: 2600,
    desc: 'Velvety rich gravy cooked with fresh milk cream, yogurt, white pepper, and green chilies.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'k4',
    category: 'karahi',
    name: 'Peshawari Charsi Tikka Karahi',
    portion: 'Full Wok',
    price: 1850,
    desc: 'Charcoal-charred chicken pieces dropped in flaming tomato wok with crushed black pepper.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80'
  },

  // Sajji & Mandi
  {
    id: 's1',
    category: 'sajji',
    name: 'Balochi Mutton Sajji with Rice',
    portion: 'Full Sajji Platter',
    price: 3200,
    desc: 'Whole spiced lamb roasted slowly over rotating wood coals, placed over scented basmati.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 's2',
    category: 'sajji',
    name: 'Whole Chicken Sajji with Kabuli Rice',
    portion: 'Full Bird + Rice Platter',
    price: 1450,
    desc: 'Crispy skin, juicy tender meat seasoned with traditional Baloch spices and sweet dry raisins.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 's3',
    category: 'sajji',
    name: 'Arabian Mutton Mandi Platter',
    portion: 'Serves 3-4 Persons',
    price: 3400,
    desc: 'Fork-tender steam-cooked lamb leg served with Yemeni mandi rice and spicy tomato daqqoos sauce.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80'
  },

  // Charcoal BBQ
  {
    id: 'b1',
    category: 'bbq',
    name: 'Melt-In-Mouth Chicken Malai Boti',
    portion: '10 Skewered Pieces',
    price: 1150,
    desc: 'Tender boneless chicken marinated overnight in cream, cardamom, and roasted on open grill.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b2',
    category: 'bbq',
    name: 'Highway Beef Behari Boti',
    portion: '1 Plate (Rich Spice)',
    price: 1050,
    desc: 'Paper-thin marinated beef strips rubbed with mustard oil, papaya, and toasted Highway spices.',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'b3',
    category: 'bbq',
    name: 'Peshawari Mutton Seekh Kebabs',
    portion: '4 Large Skewers',
    price: 1250,
    desc: 'Minced lamb combined with crushed coriander, fat chunks, green herbs, grilled over glowing embers.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80'
  },

  // Rice & Biryani
  {
    id: 'r1',
    category: 'rice',
    name: 'Traditional Degi Mutton Yakhni Pulao',
    portion: 'Full Platter',
    price: 1450,
    desc: 'Aged basmati rice infused with aromatic mutton stock, whole spices, fried onions & raita.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'r2',
    category: 'rice',
    name: 'Special Highway Dum Biryani',
    portion: 'Double Meat Portion',
    price: 850,
    desc: 'Authentic Karachi saffron and spicy plum spiced layers cooked under slow coal dum.',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=400&q=80'
  },

  // Tandoor & Chai
  {
    id: 't1',
    category: 'tandoor',
    name: 'Tandoori Roghani Naan',
    portion: 'Fresh from Clay Oven',
    price: 120,
    desc: 'Warm buttery leavened flatbread sprinkled with toasted sesame seeds and butter glaze.',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 't2',
    category: 'tandoor',
    name: 'Garlic Butter Cheese Naan',
    portion: 'Clay Oven Stuffed',
    price: 320,
    desc: 'Molten cheese stuffed inside tandoori dough and brushed with fresh garlic and cilantro butter.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 't3',
    category: 'tandoor',
    name: 'Kadak Doodh Patti Chai (Highway Cup)',
    portion: 'Clay Kulhad Cup',
    price: 140,
    desc: 'The iconic Highway finish: heavy buffalo milk brewed with black tea leaves and cardamom.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 't4',
    category: 'tandoor',
    name: 'Peshawari Green Kahwa with Saffron',
    portion: 'Traditional Brass Kettle',
    price: 160,
    desc: 'Digestive green tea with whole cardamom, cinnamon bark, lemon, and crushed almonds.',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'
  }
];

function renderMenuItems(filter = 'all') {
  const container = document.getElementById('menuGrid');
  if (!container) return;

  const filtered = filter === 'all' 
    ? MENU_DATA 
    : MENU_DATA.filter(item => item.category === filter);

  container.innerHTML = filtered.map(item => `
    <div class="menu-item-card" data-category="${item.category}">
      <div class="menu-item-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
      </div>
      <div class="menu-item-content">
        <div>
          <div class="menu-item-top">
            <h4 class="menu-item-title">${item.name}</h4>
            <span class="menu-item-price">PKR ${item.price.toLocaleString()}</span>
          </div>
          <p class="menu-item-desc">${item.desc}</p>
        </div>
        <div class="menu-item-footer">
          <span class="item-portion">${item.portion}</span>
          <button class="item-add-btn" onclick="cart.addItem('${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.portion}', '${item.image}')">
            <i data-lucide="plus"></i> Add
          </button>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// Setup Menu Tabs
function initMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMenuItems(tab.getAttribute('data-filter'));
    });
  });
}

// ============================================================================
// 4. ORDER TRAY & CART MANAGEMENT SYSTEM
// ============================================================================
class CartManager {
  constructor() {
    this.items = [];
    this.cartCountEl = document.getElementById('cartCount');
    this.cartModal = document.getElementById('cartModal');
    this.cartBtn = document.getElementById('cartBtn');
    this.closeCartBtn = document.getElementById('closeCartBtn');
    this.cartItemsList = document.getElementById('cartItemsList');
    this.cartSubtotal = document.getElementById('cartSubtotal');
    this.cartTotal = document.getElementById('cartTotal');
    this.checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');

    this.bindEvents();
    this.loadFromStorage();
    this.updateUI();
  }

  bindEvents() {
    if (this.cartBtn) {
      this.cartBtn.addEventListener('click', () => this.openCart());
    }
    if (this.closeCartBtn) {
      this.closeCartBtn.addEventListener('click', () => this.closeCart());
    }
    if (this.cartModal) {
      this.cartModal.addEventListener('click', (e) => {
        if (e.target === this.cartModal) this.closeCart();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.cartModal.classList.contains('open')) {
        this.closeCart();
      }
    });

    if (this.checkoutWhatsappBtn) {
      this.checkoutWhatsappBtn.addEventListener('click', () => this.dispatchWhatsAppOrder());
    }
  }

  addItem(name, price, portion, image) {
    const existing = this.items.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({ name, price, portion, image, qty: 1 });
    }
    this.saveToStorage();
    this.updateUI();
    this.showToast(`Added ${name} to Order Tray`);
  }

  changeQty(index, delta) {
    if (this.items[index]) {
      this.items[index].qty += delta;
      if (this.items[index].qty <= 0) {
        this.items.splice(index, 1);
      }
      this.saveToStorage();
      this.updateUI();
    }
  }

  openCart() {
    if (this.cartModal) {
      this.cartModal.classList.add('open');
      this.cartModal.setAttribute('aria-hidden', 'false');
    }
  }

  closeCart() {
    if (this.cartModal) {
      this.cartModal.classList.remove('open');
      this.cartModal.setAttribute('aria-hidden', 'true');
    }
  }

  updateUI() {
    const totalCount = this.items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);

    if (this.cartCountEl) {
      this.cartCountEl.textContent = totalCount;
    }

    if (!this.cartItemsList) return;

    if (this.items.length === 0) {
      this.cartItemsList.innerHTML = `
        <div class="cart-empty-message">
          <i data-lucide="shopping-bag"></i>
          <h4>Your Highway Tray is Empty</h4>
          <p>Explore our Mutton Karahi, Sajji & Charcoal BBQ to start your feast.</p>
        </div>
      `;
    } else {
      this.cartItemsList.innerHTML = this.items.map((item, idx) => `
        <div class="cart-item-row">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">PKR ${(item.price * item.qty).toLocaleString()}</div>
          </div>
          <div class="cart-qty-ctrls">
            <button class="qty-btn" onclick="cart.changeQty(${idx}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="cart.changeQty(${idx}, 1)">+</button>
          </div>
        </div>
      `).join('');
    }

    if (this.cartSubtotal) this.cartSubtotal.textContent = `PKR ${subtotal.toLocaleString()}`;
    if (this.cartTotal) this.cartTotal.textContent = `PKR ${subtotal.toLocaleString()}`;

    lucide.createIcons();
  }

  dispatchWhatsAppOrder() {
    if (this.items.length === 0) {
      alert('Please add at least one dish to your order tray.');
      return;
    }

    const orderType = document.querySelector('input[name="orderType"]:checked')?.value || 'Highway Takeout';
    const subtotal = this.items.reduce((sum, i) => sum + (i.price * i.qty), 0);

    let message = `*NEW ORDER - AL HABIB RESTAURANT (M-9)*\n`;
    message += `──────────────────\n`;
    message += `Type: *${orderType}*\n`;
    message += `Time: *${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}*\n\n`;
    message += `*Items Ordered:*\n`;

    this.items.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} (${item.portion}) x ${item.qty} = PKR ${(item.price * item.qty).toLocaleString()}\n`;
    });

    message += `\n──────────────────\n`;
    message += `*Total Amount:* PKR ${subtotal.toLocaleString()}\n`;
    message += `Customer Phone for Confirmation: [Customer will reply]\n`;
    message += `Location: Karachi-Hyderabad Motorway, Gadap Town\n`;

    const encoded = encodeURIComponent(message);
    const phone = '923333378677';
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`, '_blank');
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '85px';
    toast.style.right = '24px';
    toast.style.background = 'rgba(25, 18, 14, 0.95)';
    toast.style.color = '#fff';
    toast.style.border = '1px solid rgba(255, 94, 19, 0.5)';
    toast.style.padding = '10px 18px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.8), 0 0 15px rgba(255,94,19,0.3)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '0.88rem';
    toast.style.fontWeight = '600';
    toast.textContent = msg;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 2200);
  }

  saveToStorage() {
    try {
      localStorage.setItem('alhabib_cart', JSON.stringify(this.items));
    } catch (e) {
      // storage unavailable
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('alhabib_cart');
      if (data) this.items = JSON.parse(data);
    } catch (e) {
      this.items = [];
    }
  }
}

// Global cart instance
let cart;

// ============================================================================
// 5. HIGHWAY DRIVE ESTIMATOR (M-9 Motorway Simulator)
// ============================================================================
function initDriveEstimator() {
  const buttons = document.querySelectorAll('.route-btn');
  const timeEl = document.getElementById('routeTime');
  const distEl = document.getElementById('routeDist');
  const roadEl = document.getElementById('routeRoad');

  const routeData = {
    sohrab: { time: '18 mins', dist: '14.2 km', road: 'M-9 Motorway' },
    bahria: { time: '12 mins', dist: '9.8 km', road: 'M-9 Direct' },
    airport: { time: '28 mins', dist: '24.5 km', road: 'Malir Cantt / M-9' },
    gulshan: { time: '25 mins', dist: '21.0 km', road: 'Lyari Exp / M-9' }
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const origin = btn.getAttribute('data-from');
      const data = routeData[origin];
      if (data && timeEl && distEl && roadEl) {
        timeEl.textContent = data.time;
        distEl.textContent = data.dist;
        roadEl.textContent = data.road;
      }
    });
  });
}

// ============================================================================
// 6. TAKHT RESERVATION FORM (With WhatsApp Hotline Dispatch)
// ============================================================================
function initReservationForm() {
  const form = document.getElementById('reservationForm');
  const dateInput = document.getElementById('resDate');

  if (dateInput) {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('resName').value;
      const phone = document.getElementById('resPhone').value;
      const date = document.getElementById('resDate').value;
      const time = document.getElementById('resTime').value;
      const guests = document.getElementById('resGuests').value;
      const seating = document.getElementById('resSeating').value;
      const special = document.getElementById('resSpecial').value || 'None';

      let msg = `*TAKHT RESERVATION REQUEST - AL HABIB RESTAURANT (M-9)*\n`;
      msg += `──────────────────\n`;
      msg += `Guest Name: *${name}*\n`;
      msg += `Phone: *${phone}*\n`;
      msg += `Date: *${date}*\n`;
      msg += `Arrival Time: *${time}*\n`;
      msg += `Guests: *${guests}*\n`;
      msg += `Seating Preference: *${seating}*\n`;
      msg += `Pre-Fire Dish Request: *${special}*\n`;
      msg += `──────────────────\n`;
      msg += `_Sent via Al Habib 3D Highway Portal_`;

      const encoded = encodeURIComponent(msg);
      window.open(`https://api.whatsapp.com/send?phone=923333378677&text=${encoded}`, '_blank');
      form.reset();
      alert('Your Takht booking request has been opened in WhatsApp for instant verification with the Highway Manager.');
    });
  }
}

// ============================================================================
// 7. MOBILE NAVIGATION & SMOOTH SCROLL OBSERVER
// ============================================================================
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-item');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // Active state on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

// ============================================================================
// 8. GSAP CHOREOGRAPHY & SCROLL ENHANCEMENTS
// ============================================================================
function initGSAPAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance animation
  gsap.from('.hero-tag', {
    y: -30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  });

  gsap.from('.hero-heading span', {
    y: 40,
    opacity: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power3.out'
  });

  gsap.from('.hero-subheading', {
    y: 30,
    opacity: 0,
    duration: 1,
    delay: 0.4,
    ease: 'power3.out'
  });

  gsap.from('.hero-ctas a', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    delay: 0.6,
    ease: 'power3.out'
  });

  gsap.from('.hero-centerpiece', {
    scale: 0.92,
    opacity: 0,
    duration: 1.2,
    delay: 0.7,
    ease: 'power3.out'
  });

  // Stagger cards on scroll
  gsap.utils.toArray('.card-3d').forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: (i % 3) * 0.1,
      ease: 'power2.out'
    });
  });

  gsap.utils.toArray('.ambiance-feature-card').forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 80%'
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
  });
}

// ============================================================================
// DOM INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Canvas
  new ThreeDBackground();

  // 2. Initialize Sound Synthesizer
  new HighwayAudioAmbience();

  // 3. Render Menu & Tabs
  renderMenuItems('all');
  initMenuTabs();

  // 4. Cart Manager
  cart = new CartManager();

  // 5. Drive Calculator
  initDriveEstimator();

  // 6. Reservation Form
  initReservationForm();

  // 7. Navigation
  initNavigation();

  // 8. GSAP Choreography
  initGSAPAnimations();

  // 9. Initialize VanillaTilt if available
  if (typeof VanillaTilt !== 'undefined') {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
      reverse: false,
      speed: 400,
      perspective: 1000
    });
  }
});
