import { debounce } from './debounce.js'
import { handleClickNewActiveSlide } from './clickEvent.js'

const createDotElement = (index) => `<button type="button" class="dot" data-index="${index}" aria-label="Select slide ${index}" name="Select slide ${index}"></button>`

/**
 * Set active indicator
 */
export const setActiveIndicator = (coralScrollElement, activeSlidePostion) => {
  const indicatorElement = coralScrollElement.querySelector('.coral-scroll__indicator')

  if (indicatorElement) {
    const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
    const allIndicatorDots = indicatorElement.querySelectorAll('.dot')
    const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
    const arrayOfAllSlideElements = [...allSlideElements]

    // Check if activeSlide is a clone.
    const slideElement = arrayOfAllSlideElements[activeSlidePostion]
    const isClone = slideElement?.classList.contains('js-clone')

    allIndicatorDots.forEach((dotElement) => {
      dotElement.classList.remove('js-active')

      if (isClone) {
        const cloneId = slideElement.dataset.cloneId
        const indexOfOriginalSlide = arrayOfAllSlideElements.findIndex((slideElement) => slideElement.dataset.slideId == cloneId)

        if (Number(dotElement.dataset.index) === Number(indexOfOriginalSlide)) {
          dotElement.classList.add('js-active')
        }
      } else {
        if (Number(dotElement.dataset.index) === Number(activeSlidePostion)) {
          dotElement.classList.add('js-active')
        }
      }
    })
  }
}

/**
 * Set new dots.
 */
export const setNewDots = debounce((coralScrollElement) => {
  const indicatorElement = coralScrollElement.querySelector('.coral-scroll__indicator')

  if (indicatorElement) {
    const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
    const allSlidesInScroll = sliderElement.querySelectorAll('.slide:not(.js-hidden):not(.js-clone)')
    const arrayAllSlidesInScroll = [...allSlidesInScroll]
    const startPositionId = coralScrollElement.dataset.startPositionId || 0

    // Clear all the dots.
    indicatorElement.innerHTML = ''

    // Set new dots in indicator element.
    arrayAllSlidesInScroll.map((slide, index) => {
      indicatorElement.insertAdjacentHTML('beforeEnd', createDotElement(index))
    })

    // Get position of start position id.

    // const startPosition = getPositionOfSlideById(  coralScrollElement, startPositionId)

    // handleSetNewSlide()
    // setScrollPosition(startPosition)
    // setStylingArrows(startPosition)
  }
}, 10)

/**
 * add Listener to the new dots.
 * 
 * @param {HTMLElement} coralScrollElement 
 */
export const setListenersToTheDots = (coralScrollElement, sliderConfig) => {
  const newIndicatorElement = coralScrollElement.querySelector('.coral-scroll__indicator')

  if (newIndicatorElement) {
    const allIndicatorDots = newIndicatorElement.querySelectorAll('.dot')
    const arrayOfAllIndicatorDots = [...allIndicatorDots]
    // Set event listener on dot.
    arrayOfAllIndicatorDots?.map((dotElement) => {
      dotElement.addEventListener('click', (event) => handleClickNewActiveSlide(coralScrollElement, sliderConfig, event))
    })
  }
}