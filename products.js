import {getJ,setJ,isAdmin,body} from './_lib.js';
export default async function handler(req,res){
 if(req.method==='POST'){if(!isAdmin(req))return res.status(401).end();const b=body(req);if(!Array.isArray(b))return res.status(400).end();await setJ('products',b);return res.json({ok:1})}
 res.json(await getJ('products')||[]);
}
