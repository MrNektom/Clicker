(async ()=> {
  const markup = `
  <div class="root">
    <style>
      
      * {
        /*outline:1px solid white;*/
      }
      :host {
        overflow: hidden;
      }
      :root {
        overflow: hidden;
      }
      .root {
        display: grid;
        grid-template-rows: auto 1fr;
        grid-template-columns: 1fr;
        overflow: hidden;
        height: 100%;
      }
      .tabs {
        position: sticky;
        top:0;
        left:0;
        background-color: var(background-color);
      }
      .contents {
        display: flex;
        width: 100%;
        /*outline:1px solid blue;*/
        overflow-y: hidden;
        overflow-x:scroll;
        max-height:100%;
        scroll-snap-type: x mandatory;
      }
      .contents .content {
        flex:100%;
        min-width: 100%;
        max-height: 100%;
        overflow-y: scroll;
        scroll-snap-align: center;
      }
    </style>
    <tab-view class="tabs"></tab-view>
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
    #slides = null
    #tabs = null
    constructor() {
      super()
      this.#slides = new Map()
      this.#shadow = this.attachShadow({mode:"closed"})
      this.#shadow.innerHTML = markup;
      this.#tabs = this.#shadow.querySelector(".tabs")
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
      if(!this.contains(slide)){
        this.#slides.set(slide,this.#tabs.addTab(name,"/assets/store.svg"))
        this.appendChild(slide)
      }
      //console.log(name)
    }
    #onChange(mutations, ob){
      for(let mutation of mutations){
        if(mutation.type==="childList"){
          for(let node of mutation.addedNodes){
            if(node.nodeType==1 && node.hasAttribute("m-slide")){
              let name = node.getAttribute("m-slide")
              if(name)return;
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
      :host {
        min-height:38px;
      }
      * {
        /*outline:orange solid 1px;*/
      }
      .tab {
        display:inline-block;
        padding:10px;
        transition:background-color 0.2s;
      }
      .tab:active {
        background-color:#fff2;
      }
      .tab > img {
        height: 20px;
        width: 20px;
        vertical-align: sub;
      }
    </style>
    
  </div>`
  class TabView extends HTMLElement {
    #shadow
    constructor(){
      super()
      this.#shadow = this.attachShadow({mode:"closed"})
      this.#shadow.innerHTML = markup
    }
    addTab(name, icon){
      let tab = document.createElement("span")
      tab.className = "tab"
      tab.innerText = name
      if(icon){
        let img = document.createElement("img")
        img.src = icon
        tab.prepend(img)
      }
      this.#shadow.querySelector(".root").appendChild(tab)
      return {
        get name(){
          return tab.innerText
        },
        set name(v){
          tab.innerText=v
        },
        get on(){
          return tab.addEventListener.bind(tab)
        },
        get off(){
          return tab.removeEventListener.bind(tab)
        }
      }
    }
  }
  
  customElements.define("tab-view",TabView);
})()