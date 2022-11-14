import { getCurrentSliderStates } from './getCurrentSliderStates'
import { handlePreviousSlide, handleNextSlide } from './slideActions'

/**
 * Set styling arrows.
 * 
 * @param {HTMLElement} coralScrollElement 
 * @param {object} sliderConfig 
 */
export const setStylingArrows = (coralScrollElement, sliderConfig) => {
  const arrowsElement = coralScrollElement.querySelector('.coral-scroll__arrows')

  if (!arrowsElement) return null

  const previousArrow = arrowsElement?.querySelector('.previous')
  const nextArrow = arrowsElement?.querySelector('.next')
  const currentSliderStates = getCurrentSliderStates(coralScrollElement, sliderConfig)

  // Loop over all slides and
  if (previousArrow) {
    if (currentSliderStates?.activeSlide == 0) {
      previousArrow.classList.add('js-disabled')
    } else {
      previousArrow.classList.remove('js-disabled')
    }
  }

  if (nextArrow) {
    if (currentSliderStates?.isSlideTheLastSlide === true) {
      nextArrow.classList.add('js-disabled')
    } else {
      nextArrow.classList.remove('js-disabled')
    }
  }
}

/**
 * Set listnener arrows.
 * @param {HTMLElement} coralScrollElement 
 * @param {object} sliderConfig
 */
export const setListenerArrows = (coralScrollElement, sliderConfig) => {
  const arrowsElement = coralScrollElement.querySelector('.coral-scroll__arrows')

  if (!arrowsElement) return null

  const previousArrow = arrowsElement?.querySelector('.previous')
  const nextArrow = arrowsElement?.querySelector('.next')

  previousArrow?.addEventListener('click', () => handlePreviousSlide(coralScrollElement, sliderConfig))
  nextArrow.addEventListener('click', () => handleNextSlide(coralScrollElement, sliderConfig))
}