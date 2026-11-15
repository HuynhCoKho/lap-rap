import {CANDIDATES,rankRecognition} from './recognition.js';
let classifierPromise;
async function classifier(){
 if(!classifierPromise)classifierPromise=(async()=>{
  const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
  env.allowLocalModels=false;
  env.backends.onnx.wasm.numThreads=1;
  return pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{
   device:'wasm',dtype:'q8',progress_callback:p=>{
    if(p.status==='progress')self.postMessage({type:'progress',file:p.file,progress:p.progress});
    else if(p.status==='ready')self.postMessage({type:'status',message:'Mô hình đã sẵn sàng. Đang nhận dạng ảnh…'});
   }
  });
 })().catch(e=>{classifierPromise=null;throw e;});
 return classifierPromise;
}
let busy=false;
self.onmessage=async({data})=>{
 if(data.type!=='analyze'||busy)return;busy=true;
 try{const model=await classifier();self.postMessage({type:'status',message:'Đang so khớp hình ảnh với các nhóm cấu trúc…'});
  const output=await model(data.image,CANDIDATES.map(c=>c.prompt));
  self.postMessage({type:'result',result:rankRecognition(output),requestId:data.requestId});
 }catch(e){self.postMessage({type:'error',message:e.message||'Không chạy được mô hình AI.',requestId:data.requestId});}
 finally{busy=false;}
};
