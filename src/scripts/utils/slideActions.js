import { getCurrentSliderStates } from './getCurrentSliderStates'
import { setScrollPositionWithoutScroll } from './setPosition'
import { setActiveIndicator } from './indicators'
import { setScrollPosition } from './setPosition'
import { setStylingArrows } from './arrows'

/**
 * Handle previous slide.
 */
export const handlePreviousSlide = (coralScrollElement, sliderConfig) => {
  const currentSliderStates = getCurrentSliderStates(coralScrollElement, sliderConfig)
  let newSlide = currentSliderStates?.activeSlide

  if (currentSliderStates?.activeSlide === 0) {
    newSlide = 0
  } else {
    newSlide -= 1
  }

  // setActiveThumb(newSlide)
  setActiveIndicator(coralScrollElement, newSlide)
  setScrollPosition(coralScrollElement, sliderConfig, newSlide)
  setStylingArrows(coralScrollElement, sliderConfig, newSlide)
}

/**
 * Handle next slide.
 */
export const handleNextSlide = (coralScrollElement, sliderConfig) => {
  const currentSliderStates = getCurrentSliderStates(coralScrollElement, sliderConfig)
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  const totalSlides = sliderElement.querySelectorAll('.slide:not(.js-hidden)')

  let newSlide = currentSliderStates?.activeSlide

  if (currentSliderStates?.isSlideTheSecondLastSlide) {
    if (sliderConfig.autoScrollDuration) {
      if (sliderConfig.infinite === true) {
        const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
        const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
        const activeSlide = arrayOfAllSlideElements[newSlide]
        const cloneId = activeSlide?.dataset.cloneId

        setScrollPositionWithoutScroll(coralScrollElement, sliderConfig, Number(cloneId))

        newSlide = Number(cloneId) + 1

        // newSlide = 0
      } else {
        newSlide = 0
      }
    } else {
      newSlide = totalSlides.length - 1
    }
  } else {
    newSlide += 1
  }

  // setActiveThumb(newSlide)
  setActiveIndicator(coralScrollElement, newSlide)
  setScrollPosition(coralScrollElement, sliderConfig, newSlide)
  setStylingArrows(coralScrollElement, sliderConfig, newSlide)
}