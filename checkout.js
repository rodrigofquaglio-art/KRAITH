import {setJ,redis,body,catalog,shipCost} from './_lib.js';
const EX={pix:['credit_card','debit_card','ticket','prepaid_card','atm'],card:['ticket','bank_transfer','atm'],boleto:['credit_card','debit_card','bank_transfer','prepaid_card','atm']};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).end();
 try{
  const b=body(req),o='https://'+req.headers.host,P=await catalog(o);
  // preços SEMPRE vêm do servidor, nunca do navegador
  const items=(b.items||[]).map(i=>{const p=P.find(x=>x.id==i.id);return p&&{id:p.id,n:p.n,s:i.s,q:Math.max(1,Math.min(20,+i.q|0)),p:p.p}}).filter(Boolean);
  const cep=String(b.cep||'').replace(/\D/g,'');
  if(!items.length||!b.payer?.email)return res.status(400).json({error:'Pedido inválido'});
  if(cep.length!==8)return res.status(400).json({error:'CEP inválido'});
  const sub=items.reduce((a,i)=>a+i.p*i.q,0),ship=shipCost(cep,sub).price,k=b.pay==='pix'?.95:1;
  const mp=items.map(i=>({title:`${i.n} (${i.s})`,quantity:i.q,unit_price:+(i.p*k).toFixed(2),currency_id:'BRL'}));
  if(ship)mp.push({title:'Frete',quantity:1,unit_price:ship,currency_id:'BRL'});
  const total=+mp.reduce((a,i)=>a+i.unit_price*i.quantity,0).toFixed(2),id='KR'+Date.now().toString().slice(-8);
  const r=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{Authorization:'Bearer '+process.env.MP_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({
   items:mp,payer:{name:b.payer.name,email:b.payer.email},external_reference:id,
   back_urls:{success:o+'/#/success',pending:o+'/#/success',failure:o+'/#/cart'},auto_return:'approved',notification_url:o+'/api/webhook',
   payment_methods:{excluded_payment_types:(EX[b.pay]||[]).map(t=>({id:t})),installments:b.pay==='card'?6:1}})});
  const d=await r.json();if(!d.init_point)throw new Error(JSON.stringify(d));
  await setJ('order:'+id,{id,status:'pending',items,total,pay:b.pay,payer:b.payer,cep,address:b.address||{},created:Date.now()});
  await redis('LPUSH','orders',id);
  res.json({orderId:id,total,url:d.init_point});
 }catch(e){console.error(e);res.status(500).json({error:'Não foi possível criar o pagamento'})}
}
