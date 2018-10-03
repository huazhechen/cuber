import { Component, Vue, Prop } from "vue-property-decorator";

import "./slider.css";

@Component({
    template: require("./slider.html")
})
export default class Slider extends Vue {

    @Prop({ default: 'horizontal' })
    direction: string

    @Prop({ default: 'auto' })
    width: string | number

    @Prop({ default: 6 })
    height: string | number

    @Prop({ default: 16 })
    dotSize: number

    @Prop({ default: false })
    reverse: boolean

    get wrapStyles() {
        return this.direction === 'vertical' ? {
            height: typeof this.height === 'number' ? `${this.height}px` : this.height,
            padding: `${this.dotSize / 2}px ${this.dotSize / 2}px`
        } : {
                width: typeof this.width === 'number' ? `${this.width}px` : this.width,
                padding: `${this.dotSize / 2}px ${this.dotSize / 2}px`
            }
    }

    get flowDirection() {
        return `vue-slider-${this.direction + (this.reverse ? '-reverse' : '')}`
    }

    @Prop({ default: false })
    disabled: boolean

    get disabledClass() {
        return this.disabled ? 'vue-slider-disabled' : ''
    }

    @Prop({ default: true })
    show: boolean

    @Prop({ default: true })
    clickable: boolean

    size: number = 0;
    offset: number = 0;

    getStaticData() {
        if (this.$refs.elem instanceof HTMLElement) {
            this.size = this.direction === 'vertical' ? this.$refs.elem.offsetHeight : this.$refs.elem.offsetWidth
            this.offset = this.direction === 'vertical' ? (this.$refs.elem.getBoundingClientRect().top + window.pageYOffset || document.documentElement.scrollTop) : this.$refs.elem.getBoundingClientRect().left
        }
    }

    getMousePos(e: MouseEvent) {
        return this.direction === 'vertical' ? (this.reverse ? (e.pageY - this.offset) : (this.size - (e.pageY - this.offset))) : (this.reverse ? (this.size - (e.clientX - this.offset)) : (e.clientX - this.offset))
    }

    wrapClick(e: MouseEvent) {
        if (this.disabled || !this.clickable) return false
        let pos = this.getMousePos(e)
        this.setValueOnPos(pos, false)
    }

    @Prop({ default: 0 })
    min: number

    @Prop({ default: 100 })
    max: number

    setValueOnPos(pos: number, drag: boolean) {
        let prange = [0, this.size]
        let vrange = [this.min, this.max]
        if (pos > prange[1]) {
            this.setTransform(prange[1])
            this.setCurrentValue(vrange[1], false)
        } else if (pos < prange[0]) {
            this.setTransform(prange[0])
            this.setCurrentValue(vrange[0], false)
        } else {
            this.setTransform(pos)
            let v = this.getValueByIndex(Math.round(pos / this.gap))
            this.setCurrentValue(v, drag)
        }
    }

    val: number = 0;
    flag: boolean = false;

    @Prop({ default: false })
    lazy: boolean


    setCurrentValue(val: number, drag: boolean) {
        if (val < this.min || val > this.max) return false
        if (this.val != val) {
            this.val = val
            if (!this.lazy || !this.flag) {
                this.syncValue()
            }
        }
        drag || this.setPosition()
    }

    setTransform(val: number) {
        let slider = this.$refs.dot
        let process = this.$refs.process
        if (!(slider instanceof HTMLElement && process instanceof HTMLElement)) {
            return;
        }
        let value = (this.direction === 'vertical' ? ((this.dotSize / 2) - val) : (val - (this.dotSize / 2))) * (this.reverse ? -1 : 1);
        let r = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        value = Math.round(value * r) / r;
        let translateValue = this.direction === 'vertical' ? `translateY(${value}px)` : `translateX(${value}px)`
        slider.style.transform = translateValue
        slider.style.webkitTransform = translateValue
        if (this.direction === 'vertical') {
            process.style.height = `${val}px`
            process.style[this.reverse ? 'top' : 'bottom'] = "0"
        } else {
            process.style.width = `${val}px`
            process.style[this.reverse ? 'right' : 'left'] = "0"
        }
    }
}