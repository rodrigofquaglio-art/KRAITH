import {getJ,setJ} from './_lib.js';
// Mercado Pago avisa aqui quando o pagamento muda; confirmamos consultando a API deles.
export default async function handler(req,res){
 try{
  const q=req.query||{},b=typeof req.body==='object'&&req.body||{},pid=q['data.id']||b.data?.id,type=q.type||q.topic||b.type;
  if(pid&&type==='payment'){
   const p=await(await fetch('https://api.mercadopago.com/v1/payments/'+pid,{headers:{Authorization:'Bearer '+process.env.MP_ACCESS_TOKEN}})).json();
   const o=p.external_reference&&await getJ('order:'+p.external_reference);
   if(o&&o.status!=='shipped'){o.status={approved:'paid',authorized:'paid',rejected:'cancelled',cancelled:'cancelled',refunded:'cancelled'}[p.status]||'pending';o.paymentId=pid;await setJ('order:'+o.id,o)}
  }
 }catch(e){console.error(e)}
 res.status(200).end();
}
