const U=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL,T=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;
export const redis=async(...a)=>(await(await fetch(U,{method:'POST',headers:{Authorization:'Bearer '+T},body:JSON.stringify(a)})).json()).result;
export const getJ=async k=>{const v=await redis('GET',k);return v?JSON.parse(v):null};
export const setJ=(k,v)=>redis('SET',k,JSON.stringify(v));
export const catalog=async o=>(await getJ('products'))||await(await fetch(o+'/products.json')).json();
export const isAdmin=r=>!!process.env.ADMIN_PASSWORD&&r.headers['x-admin-key']===process.env.ADMIN_PASSWORD;
export const body=r=>typeof r.body==='string'?JSON.parse(r.body||'{}'):r.body||{};
// Tabela simples por região (1º dígito do CEP). Troque por Correios/Melhor Envio quando quiser.
const Z={0:[19.9,3],1:[19.9,3],2:[24.9,4],3:[24.9,4],4:[34.9,7],5:[34.9,7],6:[39.9,9],7:[32.9,6],8:[29.9,5],9:[29.9,5]};
export const shipCost=(cep,sub)=>{const[p,d]=Z[cep[0]];return{price:sub>=299?0:p,days:d}};
