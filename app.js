
/* ===== DADOS — troque por seus produtos reais. "img" é opcional (URL da foto) ===== */
let P=[];
const CATS={men:'Homem',women:'Mulher',kids:'Infantil',beauty:'Beleza',all:'Tudo'};
const FAQ=[['Qual o prazo de entrega?','De 3 a 8 dias úteis, dependendo da região. Frete grátis acima de R$ 299.'],['Como funcionam as trocas?','Você tem 15 dias após o recebimento para solicitar troca ou devolução gratuita.'],['Quais formas de pagamento?','Cartão de crédito (até 6x sem juros), Pix (5% de desconto) e boleto.'],['Como rastrear meu pedido?','Enviamos o código de rastreio por e-mail assim que o pedido é despachado.']];
const FREE=299;

/* ===== ESTADO ===== */
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
let cart=ld('kr_cart',[]),wish=ld('kr_wish',[]),user=ld('kr_user',null),pay='card',size='M';
const sv=()=>{try{localStorage.setItem('kr_cart',JSON.stringify(cart));localStorage.setItem('kr_wish',JSON.stringify(wish));localStorage.setItem('kr_user',JSON.stringify(user))}catch{}};
const $=s=>document.querySelector(s),app=$('#app');
const fmt=v=>'R$ '+v.toFixed(2).replace('.',',');
const get=id=>P.find(x=>x.id==id);
const sub=()=>cart.reduce((a,i)=>a+get(i.id).p*i.q,0);
let shipV=null;const ship=()=>cart.length?(sub()>=FREE?0:(shipV??24.9)):0;
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('s');setTimeout(()=>t.classList.remove('s'),1800)};
const tee=c=>`<svg viewBox="0 0 100 110"><path d="M32 8 12 22 4 44l16 6 6-10v62h48V40l6 10 16-6-8-22L68 8c-3 8-10 12-18 12S35 16 32 8z" fill="${c}" stroke="rgba(0,0,0,.12)"/></svg>`;
const bg=c=>{const l=parseInt(c.slice(1,3),16);return l>130?'#cfcdc8':'#e4e3e0'};
const visual=p=>p.img?`<img src="${p.img}" alt="${p.n}" style="width:100%;height:100%;object-fit:cover">`:tee(p.t);
const card=p=>`<div class="card"><a href="#/product/${p.id}"><div class="im" style="background:${bg(p.t)}">${visual(p)}</div><h4>${p.n}</h4><p>${fmt(p.p)}</p></a><button class="heart" onclick="tw(${p.id})">${wish.includes(p.id)?'♥':'♡'}</button></div>`;

/* ===== AÇÕES ===== */
function tw(id){wish=wish.includes(id)?wish.filter(x=>x!=id):[...wish,id];sv();route(true)}
function add(id){const k=cart.find(i=>i.id==id&&i.s==size);k?k.q++:cart.push({id,s:size,q:1});sv();hdr();toast('Adicionado à sacola')}
function qty(i,d){cart[i].q+=d;if(cart[i].q<1)cart.splice(i,1);sv();route(true)}
function srch(){const q=prompt('O que você procura?');if(q)location.hash='#/shop/all/'+encodeURIComponent(q)}
function hdr(){$('#cc').textContent=cart.reduce((a,i)=>a+i.q,0);$('#wc').textContent=wish.length?'('+wish.length+')':'';$('#lg').textContent=user?'Olá, '+user.name.split(' ')[0]:'Entrar'}
function setPay(p){const v=[...document.querySelectorAll('input.i')].map(i=>i.value);pay=p;route(true);document.querySelectorAll('input.i').forEach((i,x)=>i.value=v[x]||'')}
function setSize(s){size=s;document.querySelectorAll('.sz').forEach(b=>b.classList.toggle('on',b.textContent==s))}
function login(e){e.preventDefault();const f=e.target;user={name:f.name?f.name.value:f.email.value.split('@')[0],email:f.email.value};sv();hdr();toast('Bem-vindo(a)!');location.hash='#/'}
function logout(){user=null;sv();hdr();location.hash='#/'}
function mask(el,t){let v=el.value.replace(/\D/g,'');if(t=='c')v=v.slice(0,16).replace(/(.{4})/g,'$1 ').trim();if(t=='v')v=v.slice(0,4).replace(/(\d{2})(\d)/,'$1/$2');if(t=='cpf')v=v.slice(0,11).replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1-$2');if(t=='cep')v=v.slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');el.value=v}
async function place(e){e.preventDefault();const f=[...e.target.querySelectorAll('input.i')].map(i=>i.value),b=e.target.querySelector('button.btn');b.disabled=true;b.textContent='Aguarde...';
try{const r=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:cart,pay,cep:f[3],payer:{email:f[0],name:f[1],cpf:f[2]},address:{city:f[4],street:f[5],number:f[6],extra:f[7]}})});const d=await r.json();if(!r.ok)throw d;
sessionStorage.setItem('kr_order',JSON.stringify({o:d.orderId,t:d.total,pay}));const L=ld('kr_orders',[]);L.unshift({o:d.orderId,e:f[0]});localStorage.setItem('kr_orders',JSON.stringify(L));cart=[];sv();location.href=d.url}catch(x){toast(x.error||'Erro ao criar o pedido');b.disabled=false;b.textContent='Confirmar pedido'}}

/* ===== PÁGINAS ===== */
const pages={
home:()=>`
<section class="hero"><div class="eyebrow">Moda<br>que se move<br>com você.</div><h1>KRAITH</h1>
<div class="fig">${tee('#3d3d39')}</div>
<div class="cta"><a class="btn" href="#/shop/all">Comprar agora</a><a class="lnk" href="#/shop/all">Explorar novidades</a></div>
<div class="nc eyebrow">Nova<br>Coleção<br>2026</div></section>
<section class="band">${[['men','Homem','Básicos elevados para o dia a dia.','#222'],['women','Mulher','Estilo sem esforço para todas.','#cbbfae'],['kids','Infantil','Conforto e muita atitude.','#d9d4cb']].map(([k,n,d,c])=>`<a href="#/shop/${k}"><div class="th" style="background:${c};display:flex;align-items:center">${tee(c=='#222'?'#444':'#fff')}</div><div><h3>${n.toUpperCase()}</h3><p>${d}</p><span class="lnk" style="border-color:#fff">Ver ${n} →</span></div></a>`).join('')}</section>
<section class="promo"><div><div class="eyebrow">Nova estação</div><h2>NOVOS<br>ESTILOS</h2><p style="margin-bottom:24px">Descubra tudo o que há de novo e de agora.</p><a class="btn" href="#/shop/all">Ver coleção</a></div><div class="img"></div></section>
<section class="perks">${[['Entrega rápida','Rápida e segura'],['Trocas fáceis','Em até 15 dias'],['Qualidade garantida','Melhor moda, melhor qualidade'],['Pagamento seguro','Checkout 100% seguro']].map(([a,b])=>`<div><b>${a}</b><span>${b}</span></div>`).join('')}</section>
<section class="sec"><div class="sh"><h2>Best of KRAITH</h2><a class="lnk" href="#/shop/all">Ver tudo</a></div><div class="grid">${P.slice(0,8).map(card).join('')}</div></section>
<section class="box" style="margin:0 52px 50px;text-align:center;padding:50px"><h2 style="margin-bottom:8px">Entre para a KRAITH</h2><p style="margin-bottom:18px;color:var(--mut)">Receba lançamentos e 10% off na primeira compra.</p><form onsubmit="event.preventDefault();toast('Inscrição confirmada!');this.reset()" style="display:flex;gap:10px;max-width:420px;margin:auto"><input class="i" type="email" required placeholder="Seu e-mail"><button class="btn">Assinar</button></form></section>`,

shop:(c='all',q='')=>{q=decodeURIComponent(q).toLowerCase();let l=P.filter(p=>(c=='all'||p.c==c)&&p.n.toLowerCase().includes(q));
 const s=sessionStorage.getItem('kr_sort')||'';if(s=='a')l.sort((a,b)=>a.p-b.p);if(s=='d')l.sort((a,b)=>b.p-a.p);
 return `<div class="page"><h1>${q?'Busca: '+q:CATS[c]||'Tudo'}</h1><div class="chips">${Object.keys(CATS).map(k=>`<a class="chip ${k==c?'on':''}" href="#/shop/${k}">${CATS[k]}</a>`).join('')}<select onchange="sessionStorage.setItem('kr_sort',this.value);route(true)"><option value="">Ordenar</option><option value="a" ${s=='a'?'selected':''}>Menor preço</option><option value="d" ${s=='d'?'selected':''}>Maior preço</option></select></div>${l.length?`<div class="grid">${l.map(card).join('')}</div>`:'<p>Nenhum produto encontrado.</p>'}</div>`},

product:id=>{const p=get(id);if(!p)return pages.nf();size='M';const cl=p.c=='beauty';
 return `<div class="page"><p style="margin-bottom:20px;font-size:12px"><a href="#/shop/${p.c}">← ${CATS[p.c]}</a></p><div class="pd"><div class="im" style="background:${bg(p.t)}">${visual(p)}</div><div><div class="eyebrow" style="color:var(--mut)">${CATS[p.c]}</div><h1>${p.n}</h1><div class="price">${fmt(p.p)}</div><p style="color:var(--mut);margin-bottom:22px">Ou 3x de ${fmt(p.p/3)} sem juros. Peça essencial da coleção 2026, produzida com materiais selecionados e acabamento premium.</p>
 ${cl?'':`<div class="lbl">Tamanho</div><div class="sizes">${['P','M','G','GG'].map(s=>`<button class="sz ${s=='M'?'on':''}" onclick="setSize('${s}')">${s}</button>`).join('')}</div>`}
 <div style="display:flex;gap:10px"><button class="btn" style="flex:1" onclick="add(${p.id})">Adicionar à sacola</button><button class="chip" onclick="tw(${p.id})">${wish.includes(p.id)?'♥':'♡'}</button></div>
 <details style="margin-top:28px" open><summary>Entrega e trocas</summary><p>Frete grátis acima de R$ 299. Trocas em até 15 dias.</p></details></div></div>
 <div class="sh" style="margin-top:60px"><h2>Você também pode gostar</h2></div><div class="grid">${P.filter(x=>x.c==p.c&&x.id!=p.id).concat(P).filter((x,i,a)=>x.id!=p.id&&a.indexOf(x)==i).slice(0,4).map(card).join('')}</div></div>`},

cart:()=>{if(!cart.length)return `<div class="page ctr"><h1>Sua sacola está vazia</h1><a class="btn" href="#/shop/all">Continuar comprando</a></div>`;
 return `<div class="page"><h1>Sacola</h1><div class="two"><div>${cart.map((i,x)=>{const p=get(i.id);return `<div class="row"><div class="t" style="background:${bg(p.t)}">${visual(p)}</div><div><a href="#/product/${p.id}"><b>${p.n}</b></a><p style="color:var(--mut)">Tamanho ${i.s}</p><div class="qty"><button onclick="qty(${x},-1)">−</button><span>${i.q}</span><button onclick="qty(${x},1)">+</button></div></div><b>${fmt(p.p*i.q)}</b></div>`}).join('')}</div>${summary(true)}</div></div>`},

checkout:()=>{if(!cart.length)return pages.cart();
 return `<div class="page"><h1>Finalizar compra</h1><div class="steps"><b>1 Dados</b><b>2 Entrega</b><b>3 Pagamento</b></div><form class="two" onsubmit="place(event)"><div>
 <div class="lbl" style="margin-bottom:12px">Contato</div><div class="f"><input class="i full" type="email" required placeholder="E-mail" value="${user?user.email:''}"><input class="i" required placeholder="Nome completo" value="${user?user.name:''}"><input class="i" required placeholder="CPF" inputmode="numeric" oninput="mask(this,'cpf')"></div>
 <div class="lbl" style="margin-bottom:12px">Entrega</div><div class="f"><input class="i" required placeholder="CEP" inputmode="numeric" oninput="calcShip(this)"><input class="i" required placeholder="Cidade"><input class="i full" required placeholder="Endereço"><input class="i" required placeholder="Número"><input class="i" placeholder="Complemento"><p id="sd" class="full" style="color:var(--mut);font-size:12px"></p></div>
 <div class="lbl" style="margin-bottom:12px">Pagamento</div><div class="tabs">${[['card','Cartão'],['pix','Pix (-5%)'],['boleto','Boleto']].map(([k,n])=>`<button type="button" class="tab ${pay==k?'on':''}" onclick="setPay('${k}')">${n}</button>`).join('')}</div>
 ${pay=='card'?`<p>Você será levado ao Mercado Pago para inserir o cartão com segurança (até 6x sem juros).</p>`:pay=='pix'?`<p>Você será levado ao Mercado Pago para pagar com Pix (QR Code e copia e cola).</p>`:`<p>O boleto será gerado no Mercado Pago após confirmar.</p>`}
 </div>${summary(false)}</form></div>`},

success:()=>{const o=JSON.parse(sessionStorage.getItem('kr_order')||'null');if(!o)return pages.home();
 return `<div class="page ctr"><h1>Pedido recebido ✓</h1><p>Obrigado pela compra! Número do pedido: <b>#${o.o}</b></p><p style="margin:6px 0 24px;color:var(--mut)">Total: ${fmt(o.t)} · Pagamento: ${{card:'Cartão',pix:'Pix',boleto:'Boleto'}[o.pay]}</p><a class="btn" href="#/orders">Meus pedidos</a></div>`},

wishlist:()=>`<div class="page"><h1>Favoritos</h1>${wish.length?`<div class="grid">${wish.map(get).filter(Boolean).map(card).join('')}</div>`:'<p>Você ainda não favoritou nada.</p>'}</div>`,

login:()=>user?`<div class="page ctr"><h1>Olá, ${user.name}</h1><p style="margin-bottom:20px">${user.email}</p><button class="btn" onclick="logout()">Sair</button></div>`:
 `<div class="page"><div class="two" style="max-width:860px;margin:auto"><form onsubmit="login(event)"><h1 style="font-size:22px">Entrar</h1><div class="f"><input class="i full" name="email" type="email" required placeholder="E-mail"><input class="i full" type="password" required placeholder="Senha"></div><button class="btn w">Entrar</button></form><form onsubmit="login(event)"><h1 style="font-size:22px">Criar conta</h1><div class="f"><input class="i full" name="name" required placeholder="Nome"><input class="i full" name="email" type="email" required placeholder="E-mail"><input class="i full" type="password" required minlength="6" placeholder="Senha (mín. 6)"></div><button class="btn w">Criar conta</button></form></div></div>`,

help:()=>`<div class="page" style="max-width:800px;margin:auto"><h1>Ajuda</h1>${FAQ.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`,
nf:()=>`<div class="page ctr"><h1>Página não encontrada</h1><a class="btn" href="#/">Início</a></div>`
};

function summary(go){const s=sub(),sh=ship(),d=pay=='pix'&&!go?s*.05:0;
 return `<div class="box"><div class="lbl">Resumo</div><div class="l" style="margin-top:16px"><span>Subtotal</span><span>${fmt(s)}</span></div><div class="l"><span>Frete</span><span>${sh?fmt(sh):'Grátis'}</span></div>${d?`<div class="l"><span>Desconto Pix</span><span>−${fmt(d)}</span></div>`:''}<div class="l tot"><span>Total</span><span>${fmt(s+sh-d)}</span></div><br>${go?'<a class="btn w" href="#/checkout" style="text-align:center">Finalizar compra</a>':'<button class="btn w">Confirmar pedido</button>'}</div>`}

/* ===== ROTEADOR ===== */
function route(keep){const [,r='',a,b]=(location.hash||'#/').slice(1).split('?')[0].split('/');
 const m={'':()=>pages.home(),shop:()=>pages.shop(a,b),product:()=>pages.product(a),cart:pages.cart,checkout:pages.checkout,success:pages.success,wishlist:pages.wishlist,orders:()=>pages.orders(),login:pages.login,help:pages.help};
 const y=scrollY;app.innerHTML=(m[r]||pages.nf)();hdr();keep===true?scrollTo(0,y):scrollTo(0,0)}

async function calcShip(el){mask(el,'cep');const c=el.value.replace(/\D/g,'');if(c.length<8)return;try{const r=await(await fetch('/api/shipping?cep='+c+'&sub='+sub())).json();shipV=r.price;$('#sd').textContent='Entrega em até '+r.days+' dias úteis';document.querySelector('.box').outerHTML=summary(false)}catch{}}
const ST={pending:'Aguardando pagamento',paid:'Pago',shipped:'Enviado',cancelled:'Cancelado'};
pages.orders=()=>{setTimeout(showOrders);return `<div class="page" style="max-width:760px;margin:auto"><h1>Meus pedidos</h1><form class="f" onsubmit="addOrder(event)"><input class="i" name="o" required placeholder="Nº do pedido (ex.: KR12345678)"><input class="i" name="e" type="email" required placeholder="E-mail da compra"><button class="btn full">Consultar pedido</button></form><div id="ol"></div></div>`};
function addOrder(e){e.preventDefault();const L=ld('kr_orders',[]),o=e.target.o.value.trim().toUpperCase();if(!L.find(x=>x.o==o))L.unshift({o,e:e.target.e.value.trim()});localStorage.setItem('kr_orders',JSON.stringify(L));showOrders()}
async function showOrders(){const bx=$('#ol');if(!bx)return;const L=ld('kr_orders',[]);if(!L.length){bx.innerHTML='<p>Nenhum pedido ainda.</p>';return}
bx.innerHTML=(await Promise.all(L.map(async x=>{try{const d=await(await fetch(`/api/orders?o=${x.o}&email=${encodeURIComponent(x.e)}`)).json();if(!d.id)return '';return `<div class="row" style="grid-template-columns:1fr auto"><div><b>#${d.id}</b><p style="color:var(--mut)">${new Date(d.created).toLocaleDateString('pt-BR')} · ${d.items.map(i=>i.n+' ×'+i.q).join(', ')}</p>${d.tracking?`<p>Rastreio: ${d.tracking}</p>`:''}</div><div style="text-align:right"><b>${fmt(d.total)}</b><p>${ST[d.status]||d.status}</p></div></div>`}catch{return ''}}))).join('')||'<p>Pedido não encontrado.</p>'}
addEventListener('hashchange',()=>route());
(async()=>{for(const u of['/api/products','/products.json']){try{const d=await(await fetch(u)).json();if(d.length){P=d;break}}catch{}}cart=cart.filter(i=>get(i.id));sv();route()})();
