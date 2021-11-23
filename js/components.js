(async ()=> {
  const markup = `
  <div class="root">
    <style>
      
      * {
        outline:1px solid white;
      }
      .root {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-template-columns: 1fr;
      }
      .tabs {
        display:flex;
      }
      .tabs > .tab {
        padding:10px;
      }
      .contents {
        display: flex;
        width: 100%;
        /*outline:1px solid blue;*/
        overflow: scroll;
      }
      .contents .content {
        flex:100%;
        min-width: 100%;
      }
    </style>
    <div class="tabs"></div>
    <div class="contents"></div>
  </div>`
  const tmp = document.createElement("template")
  tmp.innerHTML = `
    <div class="tab">
      <span></span>
      <button>&times;</button>
    </div>
  `

  class Slider extends HTMLElement {
    #shadow = null
    #observer = null
    #slides= null
    constructor() {
      super()
      this.#slides = new Map()
      this.#shadow = this.attachShadow({mode:"closed"})
      this.#shadow.innerHTML = markup;
      let ob = this.#observer = new MutationObserver(this.#onChange.bind(this))
      ob.observe(this,{
        childList:true,
        attributes:true,
        attributeFilter:["m-slide"]
      })
    }
    addSlide(name, slide, opts) {
      if(!opts){
        opts = {
          closeable:false
        }
      }
      if(name instanceof Element && name.hasAttibute("slider")){
        slide = name;
        name = slide.getAttribute("m-slide")
      }
      if(!slide.hasAttribute("m-slide")){
        slide.setAttribute("m-slide",name)
      }
      slide.slot = name
      let contents = this.#shadow.querySelector(".contents")
      let content = document.createElement("div")
      content.className = "content"
      content.innerHTML = `<slot name="${name}"></slot>`
      contents.appendChild(content)
      let tab = tmp.content.querySelector(".tab").cloneNode(true)
      tab.query("span").innerText = name
      if(!opts.closeable){
        tab.query("button").hidden = true
      }
      this.#slides.set(slide,tab)
      if(!this.contains(slide)){
        this.appendChild(slide)
        this.#shadow.query(".tabs").appendChild(tab)
      }
    }
    #onChange(mutations, ob){
      for(let mutation of mutations){
        if(mutation.type==="childList"){
          for(let node of mutation.addedNodes){
            if(node.nodeType==1 && node.hasAttribute("m-slide")){
              let name = node.getAttribute("m-slide")
              this.addSlide(name,node)
            }
          }
        }
        if(mutation.type==="attributes"){
          
        }
      }
    }
  }

  window.customElements.define("m-slider", Slider)
})();

(async ()=>{
  let markup = `
  <div class="root">
    <style>
    </style>
    
  </div>`
  class TabView extends HTMLElement {
    constructor(){
      super()
      
    }
  }
  
  customElements.define("tab-view",TabView);
})()