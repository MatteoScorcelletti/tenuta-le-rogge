// Navbar scroll effect
const navbar = document.getElementById('navbar');
let ticking = false;

window.addEventListener('scroll', function () {
  if (!ticking) {
    requestAnimationFrame(function () {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
      ticking = false;
    });
    ticking = true;
  }
});

// Mobile navigation
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

function toggleNav() {
  var isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
}

function closeNav() {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

// Close on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    if (navLinks.classList.contains('open')) {
      closeNav();
      hamburger.focus();
    }
    if (document.getElementById('cartDrawer').classList.contains('open')) {
      toggleCart();
    }
  }
});

// Scroll animations with IntersectionObserver
var observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.fade-up').forEach(function (el) {
  observer.observe(el);
});

// ========================================
// SHOPPING CART
// ========================================
var cart = JSON.parse(localStorage.getItem('tlr-cart') || '[]');

var SHIPPING_RATES = {
  italy: 9,
  eu: 20,
  world: 40
};

var MIN_BOTTLES = 6;

function saveCart() {
  localStorage.setItem('tlr-cart', JSON.stringify(cart));
}

function getTotalBottles() {
  return cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
}

function updateCartBadge() {
  var count = getTotalBottles();
  var badges = document.querySelectorAll('.cart-count');
  badges.forEach(function (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function addToCart(id, name, price) {
  var existing = cart.find(function (item) { return item.id === id; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: id, name: name, price: price, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  renderCart();

  // Open cart drawer
  if (!document.getElementById('cartDrawer').classList.contains('open')) {
    toggleCart();
  }
}

function changeQty(id, delta) {
  var item = cart.find(function (i) { return i.id === id; });
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(function (i) { return i.id !== id; });
  }
  saveCart();
  updateCartBadge();
  renderCart();
}

function updateCartTotals() {
  var subtotal = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
  var totalBottles = getTotalBottles();
  var cases = Math.ceil(totalBottles / 6);
  var zone = document.getElementById('shippingZone').value;
  var shipping = cases * SHIPPING_RATES[zone];

  document.getElementById('cartSubtotal').textContent = '\u20AC' + subtotal.toFixed(2);
  document.getElementById('cartShipping').textContent = '\u20AC' + shipping.toFixed(2);
  document.getElementById('cartTotal').textContent = '\u20AC' + (subtotal + shipping).toFixed(2);

  // Show minimum warning
  var noteEl = document.querySelector('.cart-min-note');
  if (noteEl) {
    if (totalBottles > 0 && totalBottles < MIN_BOTTLES) {
      var isIT = document.documentElement.lang === 'it';
      noteEl.innerHTML = '<span class="cart-min-warning">' +
        (isIT ? 'Aggiungi ancora ' + (MIN_BOTTLES - totalBottles) + ' bottiglie per raggiungere il minimo di 6.'
              : 'Add ' + (MIN_BOTTLES - totalBottles) + ' more bottles to reach the minimum of 6.') +
        '</span>';
    } else {
      var isIT2 = document.documentElement.lang === 'it';
      noteEl.textContent = isIT2 ? 'Ordine minimo: 6 bottiglie (1 cartone), anche miste.' : 'Minimum order: 6 bottles (1 case), can be mixed.';
    }
  }

  return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
}

function renderCart() {
  var body = document.getElementById('cartBody');
  var footer = document.getElementById('cartFooter');

  if (cart.length === 0) {
    var isIT = document.documentElement.lang === 'it';
    body.innerHTML = '<p class="cart-empty">' + (isIT ? 'Il carrello \u00E8 vuoto' : 'Your cart is empty') + '</p>';
    footer.style.display = 'none';
    return;
  }

  var html = '';
  cart.forEach(function (item) {
    html += '<div class="cart-item">' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div class="cart-item-price">\u20AC' + item.price.toFixed(2) + ' / bottiglia</div>' +
      '</div>' +
      '<div class="cart-item-controls">' +
        '<button class="cart-qty-btn" onclick="changeQty(\'' + item.id + '\', -1)" aria-label="Rimuovi">&minus;</button>' +
        '<span class="cart-item-qty">' + item.qty + '</span>' +
        '<button class="cart-qty-btn" onclick="changeQty(\'' + item.id + '\', 1)" aria-label="Aggiungi">+</button>' +
      '</div>' +
    '</div>';
  });
  body.innerHTML = html;
  footer.style.display = 'block';
  updateCartTotals();
}

function toggleCart() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  var isOpen = drawer.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (isOpen) renderCart();
}

// Initialize cart badge on page load
updateCartBadge();

// Send order via email
function sendOrder() {
  var isIT = document.documentElement.lang === 'it';
  var totalBottles = getTotalBottles();

  if (totalBottles < MIN_BOTTLES) {
    alert(isIT ? 'Ordine minimo: 6 bottiglie.' : 'Minimum order: 6 bottles.');
    return;
  }

  var name = document.getElementById('cartName').value.trim();
  var address = document.getElementById('cartAddress').value.trim();
  var city = document.getElementById('cartCity').value.trim();
  var zip = document.getElementById('cartZip').value.trim();
  var country = document.getElementById('cartCountry').value.trim();
  var email = document.getElementById('cartEmail').value.trim();
  var phone = document.getElementById('cartPhone').value.trim();

  if (!name || !address || !city || !zip || !country || !email) {
    alert(isIT ? 'Per favore compila tutti i campi obbligatori.' : 'Please fill in all required fields.');
    return;
  }

  var totals = updateCartTotals();
  var zone = document.getElementById('shippingZone');
  var zoneName = zone.options[zone.selectedIndex].text;

  var lines = [];
  lines.push(isIT ? 'NUOVO ORDINE — Tenuta le Rogge' : 'NEW ORDER — Tenuta le Rogge');
  lines.push('');
  lines.push(isIT ? '--- CLIENTE ---' : '--- CUSTOMER ---');
  lines.push((isIT ? 'Nome: ' : 'Name: ') + name);
  lines.push((isIT ? 'Indirizzo: ' : 'Address: ') + address);
  lines.push((isIT ? 'Città: ' : 'City: ') + city + ' ' + zip);
  lines.push((isIT ? 'Paese: ' : 'Country: ') + country);
  lines.push('Email: ' + email);
  if (phone) lines.push((isIT ? 'Telefono: ' : 'Phone: ') + phone);
  lines.push('');
  lines.push(isIT ? '--- ORDINE ---' : '--- ORDER ---');

  cart.forEach(function (item) {
    lines.push(item.qty + 'x ' + item.name + ' — €' + (item.price * item.qty).toFixed(2));
  });

  lines.push('');
  lines.push((isIT ? 'Subtotale: €' : 'Subtotal: €') + totals.subtotal.toFixed(2));
  lines.push((isIT ? 'Spedizione (' : 'Shipping (') + zoneName + '): €' + totals.shipping.toFixed(2));
  lines.push((isIT ? 'TOTALE: €' : 'TOTAL: €') + totals.total.toFixed(2));

  var subject = encodeURIComponent(isIT ? 'Nuovo ordine da ' + name : 'New order from ' + name);
  var body = encodeURIComponent(lines.join('\n'));

  window.location.href = 'mailto:albertocarlotti@hotmail.it?subject=' + subject + '&body=' + body;
}
