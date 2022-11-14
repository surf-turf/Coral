
/**
 * Get position of slide by id.
 * 
 * @param {string} slideId 
 * 
 * @returns {number}
 */
export const getPositionOfSlideById = (coralScrollElement, slideId) => {
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
  const arrayOfAllSlideElements = [...allSlideElements]
  const indexOfNewSlide = arrayOfAllSlideElements.findIndex((slideElement) => {

    return slideElement.dataset.deeplinkTarget == slideId
  })

  return indexOfNewSlide
}

/**
 * Get slide id by position.
 * 
 * @param {Number} position 
 * 
 * @returns {Number} sideId
 */
export const getSlideIdByPosition = (coralScrollElement, position) => {
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  const allSlidesInScroll = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
  const arrayAllSlidesInScroll = [...allSlidesInScroll]

  return arrayAllSlidesInScroll[position]?.getAttribute('id') || null
}