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
        scroll-behavior: smooth;
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
      this.#slides = []
      this.#shadow = this.attachShadow({mode:"closed"})
      this.#shadow.innerHTML = markup;
      this.#tabs = this.#shadow.querySelector(".tabs")
      this.#tabs.addEventListener("switch",e=>{
        let [tab, tabD] = this.#slides.find(t=>e.detail.tab==t[1]?t:null)
       this.#shadow.querySelector(".contents")
       .scrollBy(tab.getBoundingClientRect().x,0)
      })
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
      if(name instanceof Element && name.slot){
        slide = name;
        name = slide.slot
      }
      if(!slide.slot){
        slide.slot = name
      }
      let contents = this.#shadow.querySelector(".contents")
      let content = document.createElement("div")
      content.className = "content"
      content.innerHTML = `<slot name="${name}"></slot>`
      contents.appendChild(content)
      if(!this.contains(slide)){
        this.#slides.push([slide,this.#tabs.addTab(name)])
        this.appendChild(slide)
      }
      //console.log(name)
    }
    #onChange(mutations, ob){
      for(let mutation of mutations){
        if(mutation.type==="childList"){
          for(let node of mutation.addedNodes){
            if(node.nodeType==1 && node.slot){
              let name = node.slot
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
      .tab.current {
        background-color:#fff5;
      }
      .tab.current:active {
        background-color:#fff6;
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
    #current
    #tabs
    constructor(){
      super()
      this.#tabs = []
      this.#shadow = this.attachShadow({mode:"closed"})
      this.#shadow.innerHTML = markup
      this.#shadow.addEventListener("click",e=>{
        let tgt = e.target.closest(".tab")
        if(!tgt || tgt.classList.contains("current")) return;
        if(this.#current)this.#current.classList.remove("current");
        tgt.classList.add("current")
        this.#current = tgt
        this.dispatchEvent(new CustomEvent("switch",{detail:{tab:this.#tabs.find(v=>v[1]==tgt)[0]}}))
      })
    }
    addTab(name, icon){
      let tab = document.createElement("span")
      tab.className = "tab"
      if(!this.#current){
        this.#current = tab
        tab.classList.add("current")
      }
      tab.innerText = name
      if(icon){
        let img = document.createElement("img")
        img.src = icon
        tab.prepend(img)
      }
      this.#shadow.querySelector(".root").appendChild(tab)
      let r = {
        get name(){
          return tab.innerText
        },
        set name(v){
          tab.innerText=v
        },
        data:{}
      }
      this.#tabs.push([r,tab])
      return r;
    }
    removeTab(tab){
      if(!(tab instanceof Array))return false;
      [tab, tabEl] = this.#tabs.find(t=>t[0]==tab);
      
      
    }
  }
  
  customElements.define("tab-view",TabView);
})()