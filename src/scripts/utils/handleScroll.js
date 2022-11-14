import { debounce } from './debounce.js'
import { getCurrentSliderStates } from './getCurrentSliderStates'
import { setScrollPosition, setScrollPositionWithoutScroll } from './setPosition'
import { setActiveSlideClass } from './setActiveSlideClass'
import { setActiveIndicator } from './indicators'
import { setStylingArrows } from './arrows'

/**
 * Handle set new slide active. (with a debouncer)
 */
export const handleScroll = debounce((coralScrollElement, sliderConfig) => {
  const currentSlide = getCurrentSliderStates(coralScrollElement, sliderConfig)
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')

  // Reset scroll duration so it doen't awkwardly scrolls to the next slide after you slided to the previous slide 1 second ago.
  // intervalPaused = true

  setActiveSlideClass(coralScrollElement, currentSlide?.activeSlide)
  setActiveIndicator(coralScrollElement, currentSlide?.activeSlide)
  setScrollPosition(coralScrollElement, sliderConfig, currentSlide?.activeSlide)
  setStylingArrows(coralScrollElement, sliderConfig, currentSlide?.activeSlide)

  // if (thumbsParentElement) {
  //   const newActiveSlideId = getSlideIdByPosition(coralScrollElement, currentSlide.activeSlide)

  //   setActiveThumb(newActiveSlideId)
  // }

  // if (indicatorElement) {
  //   setActiveIndicator(coralScrollElement, currentSlide.activeSlide)
  // }

  // if (arrowsElement) {
  //   setStylingArrows(currentSlide.activeSlide)
  // }

  if (currentSlide.isSlideTheSecondLastSlide) {
    if (sliderConfig.infinite === true) {
      const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
      const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
      const activeSlide = arrayOfAllSlideElements[currentSlide.activeSlide]
      const cloneId = activeSlide?.dataset.cloneId

      setScrollPositionWithoutScroll(coralScrollElement, sliderConfig, Number(cloneId))
    }
  } else if (currentSlide.isSlideTheLastSlide) {
    if (sliderConfig.infinite === true) {
      const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
      const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
      const activeSlide = arrayOfAllSlideElements[currentSlide.activeSlide]
      const cloneId = activeSlide?.dataset.cloneId

      setScrollPositionWithoutScroll(coralScrollElement, sliderConfig, Number(cloneId))
    }
  }
}, 50)
