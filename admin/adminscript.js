function load(){
  let orders=JSON.parse(localStorage.getItem('kiosk_orders')||'[]').reverse();
  let div=document.getElementById('orders'); div.innerHTML='';
  orders.forEach(o=>{
    div.innerHTML+=`<div style="border:1px solid #ddd;border-radius:12px;padding:15px;margin-bottom:10px">
    <b>${o.order_number}</b> - ${o.time} - ${o.method}<br>
    ${o.items.map(i=>`${i.name} x${i.qty}`).join(', ')}<br>
    <b>₱${o.total}</b> - ${o.status}</div>`;
  });
}
load(); setInterval(load,2000);