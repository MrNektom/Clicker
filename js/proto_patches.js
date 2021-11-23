EventTarget.prototype.on = EventTarget.prototype.addEventListener
EventTarget.prototype.off = EventTarget.prototype.removeEventListener
EventTarget.prototype.emit = EventTarget.prototype.dispatchEvent


EventTarget.prototype.once = function(type, listener){
  let l = e => {
    this.off(type,l)
    listener.call(this,e)
  }
  this.on(type, l)
}


EventTarget.prototype.when = function(type,timeout){
  return new Promise ((resolve, reject)=>{
    if(typeof timeout === "number"){
      setTimeout(()=>reject(false),Math.ads(timeout))
    }
    let l = e => {
      this.off(type,l)
      resolve(e)
    }
    this.on(type, l)
  })
}

window.ajax = (path,options={}) => {
  if(!options){
    options= {}
  }
  return new Promise ((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    if("type" in options)xhr.responseType = options.type;
    
    xhr.open("GET",path, true)
    xhr.on("load",e=>{
      resolve(xhr.response)
    })
    xhr.on("error",e=>{
      reject(xhr.status)
    })
    xhr.send()
  })
}

HTMLElement.prototype.query = HTMLElement.prototype.querySelector
Document.prototype.query = Document.prototype.querySelector
Document.prototype.ce = Document.prototype.createElement
DocumentFragment.prototype.query = DocumentFragment.prototype.querySelector