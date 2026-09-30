export const sleep = ms => new Promise(r=>setTimeout(r,ms));
export async function waitFor(check, message, timeout=45000) {
  const start=Date.now();
  do { const result=await check(); if(result) return result; await sleep(125); } while(Date.now()-start<timeout);
  throw new Error(message);
}
export class Cdp {
  constructor(url) {this.socket=new WebSocket(url);this.id=0;this.pending=new Map();this.events=new Map();}
  async connect() {
    this.socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=this.pending.get(m.id);if(!p)return;clearTimeout(p.timer);this.pending.delete(m.id);m.error?p.reject(Error(m.error.message)):p.resolve(m.result);}else for(const cb of this.events.get(m.method)??[])cb(m.params);});
    this.socket.addEventListener('close',()=>this.rejectAll());
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('CDP connection timeout')),10000);this.socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});this.socket.addEventListener('error',()=>{clearTimeout(timer);reject(Error('CDP connection failed'));},{once:true});});
  }
  on(event,cb){if(!this.events.has(event))this.events.set(event,[]);this.events.get(event).push(cb);}
  send(method,params={}) {const id=++this.id;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(Error(`CDP timeout: ${method}`));},15000);this.pending.set(id,{resolve,reject,timer});this.socket.send(JSON.stringify({id,method,params}));});}
  async evaluate(expression){const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??r.exceptionDetails.text);return r.result?.value;}
  rejectAll(){for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('CDP connection closed'));}this.pending.clear();}
  close(){this.rejectAll();this.socket.close();}
}
export function pngDimensions(bytes) {
  if(bytes.length<24 || bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG');
  return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}
