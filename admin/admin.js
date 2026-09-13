// === CATEGORY MANAGER - YUSHE BITES ===
let categories = JSON.parse(localStorage.getItem('yushe_cats')) || ["Milk Tea","Fruit Tea","Snacks","Rice Meal","Yushe Special"];

function showCats(){
  document.getElementById('pCat').innerHTML = categories.map(c=>`<option value="${c}">${c}</option>`).join('');
  document.getElementById('catList').innerHTML = categories.map(c=>`<span style="background:#eee;padding:6px 10px;border-radius:20px">${c} <b onclick="delCat('${c}')" style="color:red;cursor:pointer"> x</b></span>`).join('');
}
function addCat(){
  let v = document.getElementById('newCat').value.trim();
  if(!v) return alert("Type category name");
  if(categories.includes(v)) return alert("Exists already!");
  categories.push(v);
  localStorage.setItem('yushe_cats', JSON.stringify(categories));
  document.getElementById('newCat').value='';
  showCats();
}
function delCat(name){
  if(!confirm("Delete "+name+"?")) return;
  categories = categories.filter(c=>c!==name);
  localStorage.setItem('yushe_cats', JSON.stringify(categories));
  showCats();
}
// call on load
document.addEventListener('DOMContentLoaded', showCats);
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelector(`.tab[data-tab="${name}"]`).classList.add('active');
  if (name == 'products') renderProducts();
  if (name == 'stock') renderStock();
}

function loadOrders() {
  let orders = JSON.parse(localStorage.getItem('kiosk_orders') || '[]');
  document.getElementById('totalOrders').innerText = orders.length + ' orders today';
  let div = document.getElementById('ordersList');
  div.innerHTML = '';
  if (orders.length == 0) {
    div.innerHTML = '<div style="text-align:center;padding:40px;color:#999">No orders yet</div>';
  }
  [...orders].reverse().forEach((o, i) => {
    div.innerHTML += `
      <div class="order">
        <div>
          <b style="font-size:20px">${o.order_number}</b> • ${o.time}<br>
          <span style="background:#eee;padding:2px 8px;border-radius:20px;font-size:12px">${o.method}</span><br><br>
          ${o.items.map(it => `${it.name} x${it.qty || it.quantity}`).join('<br>')}
        </div>
        <div style="text-align:right">
          <div style="font-size:18px;font-weight:bold">₱${o.total}</div><br>
          <button class="btn btn-done" onclick="markDone(${orders.length - 1 - i})">Mark Done ✅</button>
        </div>
      </div>
    `;
  });
}

function clearOrders() {
  if (confirm('Clear all orders?')) {
    localStorage.removeItem('kiosk_orders');
    loadOrders();
  }
}

function markDone(index) {
  let orders = JSON.parse(localStorage.getItem('kiosk_orders') || '[]');
  // When order done, deduct stock
  let order = orders[index];
  if (order && order.items) {
    order.items.forEach(item => {
      let p = products.find(prod => prod.id == item.id || prod.name == item.name);
      if (p) {
        p.stock = (p.stock || 0) - (item.qty || item.quantity || 1);
        if (p.stock < 0) p.stock = 0;
      }
    });
    saveToStorage();
  }
  orders.splice(index, 1);
  localStorage.setItem('kiosk_orders', JSON.stringify(orders));
  loadOrders();
  renderStock();
  renderProducts();
}

let products = JSON.parse(localStorage.getItem('yushe_products')) || JSON.parse(localStorage.getItem('kiosk_products')) || [];
let tempImage = '';

// Fix old products without stock
products.forEach(p => {
  if (p.stock === undefined) p.stock = 20;
});

function saveToStorage() {
  localStorage.setItem('yushe_products', JSON.stringify(products));
  localStorage.setItem('kiosk_products', JSON.stringify(products));
}

document.addEventListener('DOMContentLoaded', () => {
  let imgInput = document.getElementById('pImg');
  if (imgInput) {
    imgInput.addEventListener('change', function(e) {
      let file = e.target.files[0];
      if (!file) return;
      let reader = new FileReader();
      reader.onload = function(ev) {
        tempImage = ev.target.result;
        let prev = document.getElementById('preview');
        prev.src = tempImage;
        prev.style.display = 'block';
      }
      reader.readAsDataURL(file);
    });
  }
  loadOrders();
  renderProducts();
  renderStock();
  setInterval(loadOrders, 2000);
});

function saveProduct() {
  let name = document.getElementById('pName').value.trim();
  let price = document.getElementById('pPrice').value;
  let cat = document.getElementById('pCat').value;
  let stock = document.getElementById('pStock').value;
  let editId = document.getElementById('editId').value;

  if (!name || !price) {
    alert('Please enter name and price!');
    return;
  }

  if (editId) {
    let p = products.find(x => x.id == editId);
    p.name = name;
    p.price = parseInt(price);
    p.cat = cat;
    p.stock = parseInt(stock) || 0;
    if (tempImage) p.img = tempImage;
  } else {
    products.push({
      id: Date.now().toString(),
      name: name,
      price: parseInt(price),
      cat: cat,
      stock: parseInt(stock) || 20,
      img: tempImage || ''
    });
  }

  saveToStorage();
  alert('✅ Yushe Bites Product Saved!');
  clearForm();
  renderProducts();
  renderStock();
}

function renderProducts() {
  let div = document.getElementById('productList');
  if (!div) return;
  if (products.length == 0) {
    div.innerHTML = '<p>No products yet.</p>';
    return;
  }
  let h = '';
  products.forEach(p => {
    let status = p.stock == 0 ? '🔴 SOLD OUT' : p.stock <= 5 ? `🟡 LOW (${p.stock})` : `🟢 ${p.stock} in stock`;
    h += `
      <div class="prod-item">
        <div style="display:flex;align-items:center;gap:10px">
          ${p.img ? `<img src="${p.img}">` : `<span style="font-size:30px">🧋</span>`}
          <span><b>${p.name}</b><br>₱${p.price} - ${p.cat}<br><small>${status}</small></span>
        </div>
        <div>
          <button class="btn" style="background:#3498db;color:white" onclick="editProd('${p.id}')">Edit</button>
          <button class="btn" style="background:#e74c3c;color:white" onclick="delProd('${p.id}')">X</button>
        </div>
      </div>
    `;
  });
  div.innerHTML = h;
}

function renderStock() {
  let div = document.getElementById('stockList');
  let h = '';
  products.forEach(p => {
    // If product doesn't have available field, default true
    if (p.available === undefined) p.available = true;
    
    let isAvailable = p.available;
    
    h += `
      <div class="stock-row" style="${!isAvailable ? 'opacity:0.6;border-left:4px solid #ff4444' : 'border-left:4px solid #2ecc71'}">
        <div>
          <b>${p.name}</b><br>
          <small>₱${p.price} | ${p.cat}</small><br>
          <small>${isAvailable ? '✅ Available on Kiosk' : '⛔ NOT AVAILABLE on Kiosk'}</small>
        </div>
        <div class="stock-controls">
          <button class="btn" style="background:${isAvailable ? '#ff4444' : '#2ecc71'};color:white;padding:10px 16px" onclick="toggleAvailable('${p.id}')">
            ${isAvailable ? 'Set as Not Available' : 'Make Available'}
          </button>
        </div>
      </div>
    `;
  });
  div.innerHTML = h;
}

function toggleAvailable(id) {
  let p = products.find(x => x.id == id);
  if (p.available === undefined) p.available = true;
  p.available = !p.available; // flip true/false
  saveToStorage();
  renderStock();
  renderProducts();
  alert(p.name + (p.available ? ' is now AVAILABLE on kiosk!' : ' is now NOT AVAILABLE on kiosk!'));
}

function changeStock(id, delta) {
  let p = products.find(x => x.id == id);
  p.stock = (p.stock || 0) + delta;
  if (p.stock < 0) p.stock = 0;
  saveToStorage();
  renderStock();
  renderProducts();
}

function setStock(id, value) {
  let p = products.find(x => x.id == id);
  p.stock = parseInt(value) || 0;
  if (p.stock < 0) p.stock = 0;
  saveToStorage();
  renderStock();
  renderProducts();
}

function toggleSold(id) {
  let p = products.find(x => x.id == id);
  if (p.stock == 0) {
    p.stock = 10;
  } else {
    p.stock = 0;
  }
  saveToStorage();
  renderStock();
  renderProducts();
}

function editProd(id) {
  let p = products.find(x => x.id == id);
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pCat').value = p.cat;
  document.getElementById('pStock').value = p.stock;
  document.getElementById('editId').value = p.id;
  if (p.img) {
    document.getElementById('preview').src = p.img;
    document.getElementById('preview').style.display = 'block';
    tempImage = p.img;
  }
  showTab('products');
  window.scrollTo(0, 0);
}

function delProd(id) {
  if (!confirm('Delete this Yushe product?')) return;
  products = products.filter(x => x.id != id);
  saveToStorage();
  renderProducts();
  renderStock();
}

function clearForm() {
  document.getElementById('pName').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pStock').value = '';
  document.getElementById('pImg').value = '';
  document.getElementById('editId').value = '';
  document.getElementById('preview').style.display = 'none';
  tempImage = '';
}