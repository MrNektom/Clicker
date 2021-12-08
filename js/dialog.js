(async ()=> {



  const defaultMarkup =`
  <div class="dialog_window">
    <span class="dialog_title">Title</span>
    <div class="dialog_content">Content</div>
    <div class="dialog_footer">
      <button class="dialog_button ok_button">Ok</button>
    </div>
  </div>`;
  let currentDialog = null;

  const StateType = {
    HIDDEN: Symbol("HIDDEN"),
    SHOWED: Symbol("SHOWED"),
    SHOWING: Symbol("SHOWING"),
    CLOSING: Symbol("CLOSING"),
  }

  class Dialog extends EventTarget {
    _dialog = null
    #state = StateType.HIDDEN

    constructor(options = {}) {
      super()
      if (typeof options !== "object") {
        options = {}
      }
      let d = this._dialog = document.createElement("div");
      d.classList.add("dialog_wrapper")
      d.innerHTML = defaultMarkup
      d.querySelector(".ok_button")
      .addEventListener("click", this.close.bind(this))
      d.addEventListener("click", e => {
        if (e.target === d) {
          this.close()
        }
      })
      if(options.ok_btn_label){
        d.querySelector(".ok_button")
        .innerText = options.ok_btn_label
      }
    }

    show() {
      //console.log(this.state)
      return new Promise(async (resolve, reject)=> {
        if (this.#state === StateType.SHOWING)return;
        if (this.#state === StateType.SHOWED)return;
        if (this.#state === StateType.CLOSING) {
          console.log("self wait")
          await this.when("close")
        }
        this.#state = StateType.SHOWING
        //console.log("44")
        if (currentDialog !== null) {

          console.log("curr wait")
          await currentDialog.when("close")
        }
        //console.log("48")

        currentDialog = this
        document.body.appendChild(this._dialog)
        let dw = this._dialog.querySelector(".dialog_window")
        let {
          height
        } = getComputedStyle(dw)
        await dw.animate([{
          transform: `translateY(${height})`
        }, {
          transform: "translateY(0px)"
        }], {
          duration: 400,
          easing: "ease"
        })
        this._dialog.animate([{
          opacity: 0
        }, {
          opacity: 1
        }], {
          duration: 400,
          easing: "ease"
        }).when("finish")
        this.#state = StateType.SHOWED
        resolve ()
        this.emit(new CustomEvent("show"))
      })
    }

    async close() {
      //console.log(this.state)
      if (this.#state === StateType.HIDDEN)return;
      if (this.#state === StateType.CLOSING)return;
      this.#state = StateType.CLOSING

      let dw = this._dialog.querySelector(".dialog_window")
      let {
        height
      } = getComputedStyle(dw)
      this._dialog.animate(
        [{
          opacity: 1
        }, {
          opacity: 0
        }], {
          duration: 400,
          easing: "ease"
        })
      let e = await dw.animate([{
        transform: "translateY(0px)"
      }, {
        transform: `translateY(${height})`
      }], {
        duration: 400,
        easing: "ease"
      }).when("finish")
      this._dialog.remove()
      this.#state = StateType.HIDDEN
      currentDialog = null
      this.emit(new CustomEvent("close"))
    }
    
    set title(v) {
      this._dialog.querySelector(".dialog_title")
      .innerText = String(v)
    }
    get title() {
      return this._dialog.querySelector(".dialog_title")
      .innerText
    }
    set content(v) {
      let dc = this._dialog.querySelector(".dialog_content")
      dc.innerHTML = ""
      dc.append(v)
    }
    get content() {
      return this._dialog.querySelector(".dialog_content")
    }
    get state() {
      return this.#state
    }
  }



  window.Dialog = Dialog


})()