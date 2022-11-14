import { getPositionOfSlideById } from './getPosition'

/**
 * Handle click on thumbs or dots.
 * 
 * @param {*} event 
 */
export const handleClickNewActiveSlide = (coralScrollElement, sliderConfig, event) => {
  console.log('click')
  const thumbElement = event.target.closest('.slide')
  const dotElement = event.target.closest('.dot')
  let newActiveSlideIndex = 0

  if (thumbElement) {
    const newActiveSlideId = thumbElement.getAttribute('id')
    newActiveSlideIndex = getPositionOfSlideById(coralScrollElement, newActiveSlideId)

    // setActiveThumb(newActiveSlideId)
  }

  if (dotElement) {
    newActiveSlideIndex = dotElement.dataset.index
  }

  setActiveIndicator(coralScrollElement, newActiveSlideIndex)
  setScrollPosition(coralScrollElement, sliderConfig, newActiveSlideIndex)
  setStylingArrows(coralScrollElement, sliderConfig, newActiveSlideIndex)
}