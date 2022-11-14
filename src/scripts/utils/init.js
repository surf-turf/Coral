import { setActiveIndicator, setListenersToTheDots } from './indicators'
import { setActiveSlideClass } from './setActiveSlideClass'
import { getCurrentSliderStates } from './getCurrentSliderStates'
import { setListenerArrows } from './arrows'

/**
 * Initialize slider.
 * 
 * @param {HTMLElement} coralScrollElement 
 * @param {object} sliderConfig 
 */
export const initializeSlider = (coralScrollElement, sliderConfig) => {
  const currentSliderStates = getCurrentSliderStates(coralScrollElement, sliderConfig)
  const activeSlide = sliderConfig.startPositionId || 0

  // Set the first or dataset slide as active slide.
  setActiveSlideClass(coralScrollElement, activeSlide)

  // if (thumbsParentElement) {
  //   const newActiveSlideId = getSlideIdByPosition(activeSlide.activeSlide)

  //   setActiveThumb(newActiveSlideId)
  // }

  // Set lisntener arrows.
  setListenerArrows(coralScrollElement, sliderConfig)

  // Set listener dots.
  setListenersToTheDots(coralScrollElement, sliderConfig)

  // Set active indicator.
  setActiveIndicator(coralScrollElement, activeSlide)

  // if (sliderConfig.infinite === true) {
  //   setClonesOfSlideForInifiteScroll()
  // }
}