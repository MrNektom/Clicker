(async () => {

  const click = document.querySelector("#click");
  const score = document.querySelector("#score_value");
  const speed = document.querySelector("#speed_value");

  async function initStore(data) {
    let store = await ajax("./assets/store.json", {
      type: ""
    });
    try {
      store = JSON.parse(store)
    } catch (err) {
      console.log(err)
    }
      
    
    let storeBuys = localStorage.getItem("store")
    if (!storeBuys) {
      storeBuys = {
        Cursors: {},
        Boosts: {}
      }
    } else {
      storeBuys = JSON.parse(storeBuys)
    }
    window.on("unload",()=>{
      localStorage.setItem("store",JSON.stringify(storeBuys))
    })
    let events = new EventTarget()
    let result = {
      events,
      on: events.on.bind(events),
      off: events.off.bind(events),
      data,
      cursor(name) {
        return this.category("Cursors").item(name)
      },
      cursors() {
        return this.category("Cursors").items()
      },
      booster(name) {
        
      },
      buyCursor(name) {
        return this.category("Cursor").item(name).buy()
      },
      categories(){
        return Object.keys(store)
      },
      category(name){
        if(!store[name])return null;
        return {
          get name(){
            return name
          },
          item(itemName){
            //console.log(store[name][itemName])
            if(!store[name][itemName])return null;
            return {
              get name() {
                return itemName
              },
              get price() {
                let buys = (storeBuys[name]?storeBuys[name]:0)
                buys = buys!=null?buys[itemName]:0
                if(buys === undefined)buys = 0
                return (buys+1)*store[name][itemName].basePrice
              },
              buy() {
                let r = result.buyItem(name,itemName)
              }
            }
          },
          items(){
            let items = Object.keys(store[name])
            return items.sort((a, b) => store[name][a].basePrice - store[name][b].basePrice)
          }
        }
      },
      buyItem(category,item){
        if(data.score > result.category(category).item(item).price){
          if(!storeBuys[category])storeBuys[category]={};
          if(!storeBuys[category][item])storeBuys[category][item]=0;
          storeBuys[category][item]++
          events.emit(
            new CustomEvent("buy",{
              detail:{
                category,
                item
              }
            }
          ))
        }
      }
    }
    data.store = result;
    return
  }

  const data = {
    _speed: 0,
    _score: 0,
    _time: performance.now(),
    _timeout: null,
    _last_score: 0,
    set speed(v) {
      this._speed = parseInt(v)
      speed.innerText = this._speed
    },
    get speed() {
      return this._speed
    },
    set score(v) {
      this._score = parseInt(v)
      score.innerText = this._score
    },
    get score() {
      return this._score
    }
  }
  await initStore(data)
  {
    let s = localStorage.getItem("score")
    if (s !== null)data.score = s;
  }

  click.on("click", e => {
    data.score++
    if (data._timeout !== null) {
      clearTimeout(data._timeout)
      data._timeout = null;
    }
    data._timeout = setTimeout(()=> {
      data.speed = 0
    }, 500)
    let t = performance.now()
    let spd = 1000/(t-data._time)
    data.speed = spd
    data._time = t
  })

  window.on("unload", e=> {
      localStorage.setItem("score", data.score)
  })
  let tmp = document.query("#tmp")
  //console.log(tmp)
  let sit = tmp.content.query(".store_list_item")
  //alert()
  let dialog = new Dialog()

  dialog.title = "Store"
  
  let storeContent = document.createElement("m-slider")
  storeContent.style.backgroundColor = "#fff"
  //console.log(storeContent)
  /*
  let cursors = document.createElement("ul")
  cursors.classList.add("store_list")
  //console.log(data)
  let crsrs = data.store.cursors()
  for (let crsr of crsrs) {
    crsr = data.store.cursor(crsr)
    //console.log(crsr)
    let li = sit.cloneNode(true)
    li.query(".store_item_name").textContent = crsr.name
    li.query(".store_item_price").textContent = `${crsr.price}cp`
    
    cursors.appendChild(li)
  }
  storeContent.addSlide("Cursors",cursors)
  */
  for(let category of data.store.categories()){
    category = data.store.category(category)
    let cl = document.ce("ul")
    cl.classList.add("store_list")
    for(let item of category.items()){
      item = category.item(item)
      let li = sit.cloneNode(true)
      li.query(".store_item_name").innerText = item.name
      li.query(".store_item_price").innerText = item.price + "cp"
      cl.appendChild(li)
    }
    storeContent.addSlide(category.name,cl)
  }
  dialog.content = storeContent
  
  document.query("#store_btn").on("click",
    async e => {
      await dialog.show()

      //console.log(dialog)
    })

})().catch(err=> {
  console.info(err)
})