import {getJ,setJ,redis,isAdmin,body} from './_lib.js';
export default async function handler(req,res){
 const q=req.query;
 if(req.method==='PATCH'){if(!isAdmin(req))return res.status(401).end();const b=body(req),o=await getJ('order:'+b.id);if(!o)return res.status(404).end();o.status=b.status;o.tracking=b.tracking||'';await setJ('order:'+o.id,o);return res.json({ok:1})}
 if(q.all){if(!isAdmin(req))return res.status(401).end();const ids=await redis('LRANGE','orders',0,99)||[];return res.json((await Promise.all(ids.map(i=>getJ('order:'+i)))).filter(Boolean))}
 const o=await getJ('order:'+String(q.o||'').toUpperCase());
 if(!o||o.payer.email.toLowerCase()!==String(q.email||'').toLowerCase())return res.status(404).json({});
 res.json({id:o.id,status:o.status,total:o.total,items:o.items,created:o.created,tracking:o.tracking});
}
