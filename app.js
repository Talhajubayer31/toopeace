
/* ════════════════════════════════════════════
   Too Peace — Application Logic
   ════════════════════════════════════════════ */

// ── Product Data ──
const products = [
  { id: 1, name: 'নীলাঞ্জনা', price: 1399, image: 'images/product1.jpg', tag: 'New' },
  { id: 2, name: 'স্নিগ্ধা', price: 1599, image: 'images/product2 .jpg', tag: 'Bestseller' },
  { id: 3, name: 'মেহেক', price: 1499, image: 'images/product3.jpg', tag: '' },
  { id: 4, name: 'কাঠগোলাপ', price: 1699, image: 'images/product4.jpg', tag: 'New' },
  { id: 5, name: 'চারুলতা', price: 1399, image: 'images/product5.jpg', tag: 'Limited' },
  { id: 6, name: 'নীহারিকা', price: 1699, image: 'images/product6.jpg', tag: 'Exclusive' },
];

// ── Cart State ──
let cart = JSON.parse(localStorage.getItem('too-peace-cart')) || [];

// ── DOM References ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const productGrid = $('#product-grid');
const cartDrawer = $('#cart-drawer');
const cartOverlay = $('#cart-overlay');
const cartItemsWrap = $('#cart-items');
const cartEmpty = $('#cart-empty');
const cartFooter = $('#cart-footer');
const cartTotal = $('#cart-total');
const cartCount = $('#cart-count');
const cartCloseBtn = $('#cart-close');
const cartBtn = $('#cart-btn');
const mobileMenuBtn = $('#mobile-menu-btn');
const mobileMenu = $('#mobile-menu');
const header = $('#site-header');
const newsletterForm = $('#newsletter-form');
const checkoutBtn = $('#checkout-btn');

// Checkout & Modal
const checkoutSection = $('#checkout-section');
const mainSections = $$('section:not(#checkout-section)');
const checkoutItemsWrap = $('#checkout-items');
const checkoutSubtotal = $('#checkout-subtotal');
const checkoutGrandTotal = $('#checkout-grand-total');
const backToShopBtn = $('#back-to-shop-btn');
const checkoutForm = $('#checkout-form');

const successModal = $('#success-modal');
const successModalContent = $('#success-modal-content');
const successOrderId = $('#success-order-id');
const closeModalBtn = $('#close-modal-btn');

// ══════════════════════════════════════════════
// 1. RENDER PRODUCTS
// ══════════════════════════════════════════════
function renderProducts() {
  if (!productGrid) return;
  productGrid.innerHTML = products.map((p, i) => `
    <div class="product-card reveal" style="transition-delay: ${i * 0.1}s">
      <div class="product-image-wrap">
        ${p.tag ? `<span class="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-full bg-white/90 backdrop-blur text-brand-pink shadow-sm">${p.tag}</span>` : ''}
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='images/toopeacelogo.png';">
        <div class="img-overlay"></div>
        <button class="add-to-cart-btn btn-primary text-sm px-6 py-3" data-id="${p.id}">
          Add to Cart
        </button>
      </div>
      <div class="p-5">
        <h3 class="font-serif text-lg font-semibold text-brand-dark bengali-name">${p.name}</h3>
        <div class="flex items-center justify-between mt-2">
          <span class="gradient-text font-semibold text-lg">৳${p.price}</span>
          <div class="flex gap-0.5">
            ${'★'.repeat(5).split('').map(() => '<span class="text-brand-gold text-xs">★</span>').join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  // Attach add-to-cart listeners
  $$('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(Number(btn.dataset.id));
    });
  });

  setTimeout(initScrollReveal, 100);
}

// ══════════════════════════════════════════════
// 2. CART LOGIC
// ══════════════════════════════════════════════
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  updateCart();
  showToast(`${product.name} added to cart!`);
  openCart();
}

function updateQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart();
  updateCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCart();
}

function saveCart() {
  localStorage.setItem('too-peace-cart', JSON.stringify(cart));
}

function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Update badge
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.opacity = totalItems > 0 ? '1' : '0';
  }

  // Update drawer contents
  if (cart.length === 0) {
    cartEmpty?.classList.remove('hidden');
    cartFooter?.classList.add('hidden');
    cartItemsWrap.innerHTML = '';
  } else {
    cartEmpty?.classList.add('hidden');
    cartFooter?.classList.remove('hidden');

    cartItemsWrap.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='images/toopeacelogo.png';">
        <div class="flex-1">
          <h4 class="font-serif font-semibold text-sm">${item.name}</h4>
          <div class="flex items-center gap-3 mt-2">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
            <span class="text-xs font-medium">${item.qty}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
          </div>
          <p class="gradient-text font-semibold text-sm mt-1">৳${item.price * item.qty}</p>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" aria-label="Remove item">✕</button>
      </div>
    `).join('');
  }

  if (cartTotal) cartTotal.textContent = `৳${totalPrice}`;
}

// Global exposure for onclick handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

// ══════════════════════════════════════════════
// 3. CART DRAWER OPEN / CLOSE
// ══════════════════════════════════════════════
function openCart() {
  cartDrawer.classList.remove('translate-x-full');
  cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.add('translate-x-full');
  cartOverlay.classList.add('opacity-0', 'pointer-events-none');
  document.body.style.overflow = '';
}

cartCloseBtn?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);
cartBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  openCart();
});
  // Mobile cart link (anchor) handler
  const mobileCartLink = document.querySelector('a[href="#cart"]');
mobileCartLink?.addEventListener('click', (e) => {
  e.preventDefault();
  // Close mobile menu if it's open before opening cart drawer
  if (menuOpen) {
    menuOpen = false;
    mobileMenu.className = 'mobile-menu-closed';
    mobileMenuBtn.classList.remove('hamburger-active');
    document.body.style.overflow = '';
  }
  openCart();
});

// Checkout logic
checkoutBtn?.addEventListener('click', () => {
  if (cart.length === 0) return;
  closeCart();

  // Hide main sections, show checkout
  mainSections.forEach(sec => sec.classList.add('hidden'));
  checkoutSection.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render order summary
  renderCheckoutItems();
});

function renderCheckoutItems() {
  if (!checkoutItemsWrap) return;

  checkoutItemsWrap.innerHTML = cart.map(item => `
    <div class="flex gap-4 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl bg-gray-50" loading="lazy" onerror="this.onerror=null; this.src='images/toopeacelogo.png';">
      <div class="flex-1">
        <h4 class="font-serif text-sm font-semibold text-brand-dark">${item.name}</h4>
        <p class="text-xs text-gray-400 mt-1">Qty: ${item.qty}</p>
      </div>
      <p class="font-medium text-brand-dark">৳${item.price * item.qty}</p>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  checkoutSubtotal.textContent = `৳${subtotal}`;
  checkoutGrandTotal.textContent = `৳${subtotal + 100}`; // ৳100 flat shipping
}

// Back to Shop from Checkout
backToShopBtn?.addEventListener('click', () => {
  checkoutSection.classList.add('hidden');
  mainSections.forEach(sec => sec.classList.remove('hidden'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Confirm Order Submission
checkoutForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = $('#confirm-order-btn');
  const originalText = btn.textContent;
  btn.textContent = 'Processing...';
  btn.disabled = true;

  setTimeout(() => {
    // Generate Order ID
    const orderId = 'TP-' + Math.floor(1000 + Math.random() * 9000);
    if (successOrderId) successOrderId.textContent = orderId;

    // Show success modal
    successModal.classList.remove('hidden');
    successModal.classList.add('flex');
    setTimeout(() => {
      successModal.classList.remove('opacity-0');
      successModalContent.classList.remove('scale-95');
    }, 10);

    // Clear cart
    cart = [];
    saveCart();
    updateCart();

    // Reset form
    btn.textContent = originalText;
    btn.disabled = false;
    checkoutForm.reset();
  }, 1500);
});

// Close Success Modal
closeModalBtn?.addEventListener('click', () => {
  successModal.classList.add('opacity-0');
  successModalContent.classList.add('scale-95');

  setTimeout(() => {
    successModal.classList.add('hidden');
    successModal.classList.remove('flex');

    // Go back to shop view
    checkoutSection.classList.add('hidden');
    mainSections.forEach(sec => sec.classList.remove('hidden'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 300);
});

// ══════════════════════════════════════════════
// 4. HEADER SCROLL EFFECT
// ══════════════════════════════════════════════
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }
}, { passive: true });

// ══════════════════════════════════════════════
// 5. MOBILE MENU
// ══════════════════════════════════════════════
let menuOpen = false;
mobileMenuBtn?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    mobileMenu.className = 'mobile-menu-open';
    mobileMenuBtn.classList.add('hamburger-active');
    document.body.style.overflow = 'hidden';
  } else {
    mobileMenu.className = 'mobile-menu-closed';
    mobileMenuBtn.classList.remove('hamburger-active');
    document.body.style.overflow = '';
  }
});

$$('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    mobileMenu.className = 'mobile-menu-closed';
    mobileMenuBtn.classList.remove('hamburger-active');
    document.body.style.overflow = '';
  });
});

// ══════════════════════════════════════════════
// 6. NEWSLETTER FORM
// ══════════════════════════════════════════════
newsletterForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#newsletter-email');
  const email = input.value.trim();
  if (email) {
    $('#newsletter-success').classList.remove('hidden');
    input.value = '';
    showToast('Welcome to the Too Peace family! 💖');
    setTimeout(() => {
      $('#newsletter-success').classList.add('hidden');
    }, 5000);
  }
});

// ══════════════════════════════════════════════
// 7. SCROLL REVEAL
// ══════════════════════════════════════════════
function initScrollReveal() {
  const reveals = $$('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

// ══════════════════════════════════════════════
// 8. TOAST NOTIFICATION
// ══════════════════════════════════════════════
function showToast(message) {
  const existing = $('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="text-brand-pink text-lg">🛍️</span>
    <span class="text-sm font-medium text-brand-dark">${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3200);
}

// ══════════════════════════════════════════════
// 9. SMOOTH ANCHOR SCROLL
// ══════════════════════════════════════════════
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#cart' || href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ══════════════════════════════════════════════
// 10. CONTACT FORM
// ══════════════════════════════════════════════
const contactForm = $('#contact-form');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button');
  const originalText = btn.textContent;

  btn.textContent = 'Sending...';
  btn.disabled = true;

  setTimeout(() => {
    const successMsg = $('#contact-success');
    if (successMsg) successMsg.classList.remove('hidden');
    contactForm.reset();
    showToast('Message received! We will be in touch soon. ✨');
    btn.textContent = originalText;
    btn.disabled = false;

    setTimeout(() => {
      if (successMsg) successMsg.classList.add('hidden');
    }, 5000);
  }, 1500);
});

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCart();

  // Premium intro loader & animations trigger
  const loader = document.getElementById('intro-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('fade-out');
      document.body.classList.add('intro-complete');
    }, 1400);
  } else {
    document.body.classList.add('intro-complete');
  }
});
