let stylesheetText = `
#slider-container {
    --value : 0 ;
    --slider-track-color : #B0EFEF45 ;
    --slider-thumb-color : #fff ;
    --slider-fill-color  : #31D3C6 ;
    --slider-fill2-color : #00A2BB ;

    width : 100% ;
    height: 1rem ;
    display: flex ;
    align-items: center ;
    justify-content: center ;
    padding: 0 ;
    margin: 0 ;

    animation: color-cycle 1s infinite alternate linear;
}

@keyframes color-cycle {
    0% {
        --slider-fill-color  : #31D3C6 ;
    }
    100% {
        --slider-fill-color : #00A2BB ;
    }
}

#slider {
    -webkit-appearance: none;
    appearance: none;

    height: 1rem ;
    width: 100% ;
    margin : 0 ;
    padding: 0 ;

    background-color: #00000000 ;
    outline: none ;
    z-index: 99 ;
}

#slider-track {
    position: absolute ;
    top: calc(50% - 0.25rem);
    left: 0 ;
    width: 100% ;
    height: 0.5rem ;
    border-radius: 0.25rem ;
    background-color: var(--slider-track-color) ;
    overflow: hidden ;
}

#slider-track::before {
    position: absolute ;
    content: "" ;
    left: calc(-100% + 1.5rem) ;
    top : 0 ;
    width : calc(100% - 1rem) ;
    height: 100% ;
    background-color: var(--slider-fill-color) ;
    transition: background-color 300ms ease-out ;
    transform-origin: 100% 0%;
    transform: translateX(calc( var(--value) * 100% )) scaleX(1.2);
}

#slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width : 1rem ;
    height: 1rem ;
    border-radius: 50% ;
    background-color: var(--slider-thumb-color) ;
    cursor: pointer ;
    z-index: 99 ;
    border: 2px solid var(--slider-fill-color) ;
    transition: border-color 300ms ease-out ;
}

#value {
    position: absolute ;
    bottom: calc(100% + 0.5rem) ;
    left: calc( var(--value) * calc(100% - 1rem) - 0.8rem) ;
    min-width: 3ch ;
    border-radius: 4px ;
    pointer-events: none ;

    padding: 0.5rem ;
    display: flex ;
    align-items: center ;
    justify-content: center ;

    color: #FFF ;
    background-color: var(--slider-fill-color);
    opacity: 0 ;

    transition: left 300ms ease-out , opacity 300ms 300ms ease-out , background-color 300ms ease-out ;
}

#value::before {
    position: absolute ;
    content: "" ;
    top: 100% ;
    left: 50% ;
    width: 1rem ;
    height: 1rem ;
    border-radius: 2px ;
    background-color: inherit ;
    transform: translate(-50%,-80%) rotate(45deg);
    z-index: -1 ;
}

#slider-container:hover  #value {
    opacity: 1 ;
} 
` ;

class customSlider extends HTMLElement {
    constructor(){
        super();
        this.value = parseFloat(this.getAttribute("value")) || 0;
        this.min   = parseFloat(this.getAttribute("min"))   || 0;
        this.max   = parseFloat(this.getAttribute("max"))   || 100;
        this.step  = parseFloat(this.getAttribute("step"))  || 1;

        this.style.minWidth = "12rem" ;
        this.style.minHeight = "1rem" ;
        this.style.position = "relative" ;

        // Slider Element
        this.root = this.attachShadow({mode:"open"}) ;

        // Functionality
        this.dragging = false ;

        this.create();
        this.update();
    }

    create(){
        let slider   = document.createElement("input") ;
        let sliderContainer = document.createElement("div");
        let sliderTrack = document.createElement("div");
        let value = document.createElement("div");

        // let style = document.createElement("link");
        // style.rel = "stylesheet" ;
        // style.href = "/src/custom-slider-style.css" ;

        let style = document.createElement("style") ;
        style.innerHTML = stylesheetText ;

        // set properties
        slider.type = "range" ;
        slider.id = "slider" ;
        slider.min = this.min ;
        slider.max = this.max ;
        slider.step = this.step ;
        slider.value = this.value ;

        // add ids
        sliderContainer.id = "slider-container" ;
        sliderTrack.id = "slider-track" ;
        value.id = "value" ;

        // add event listeners
        slider.addEventListener("input",this.update.bind(this));

        // Appened Elements
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(value);
        sliderContainer.appendChild(sliderTrack);
        this.root.appendChild(style);
        this.root.appendChild(sliderContainer);
    }

    update(){
        let track  = this.root.getElementById("slider-container");
        let slider = this.root.getElementById("slider");
        let value = this.root.getElementById("value");
        let valuePercentage = slider.value / (this.max-this.min) ;
        value.innerText = slider.value ;
        track.style.setProperty("--value",valuePercentage);
    }


}

customElements.define('custom-slider', customSlider );
