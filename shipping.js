import {shipCost} from './_lib.js';
export default (req,res)=>{const c=String(req.query.cep||'').replace(/\D/g,'');if(c.length!==8)return res.status(400).json({error:'CEP inválido'});res.json(shipCost(c,+req.query.sub||0))};
