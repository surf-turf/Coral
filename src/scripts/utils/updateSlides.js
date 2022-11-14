import { setNewDots, setListenersToTheDots } from './indicators'
import { getPositionOfSlideById } from './getPosition'
import { setStylingArrows } from './arrows'
import { handleSetNewSlide } from './newSlide'

export const updateSlides = (coralScrollElement, sliderConfig) => {
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  const startPositionId = sliderConfig.startPositionId || 0
  const startPosition = getPositionOfSlideById(coralScrollElement, startPositionId)

  sliderElement.classList.add('js-updating-slides')

  // Set new dots.
  setNewDots(coralScrollElement)

  // Set styling arrows.
  setStylingArrows(coralScrollElement, sliderConfig)

  // Set new slides.
  handleSetNewSlide(coralScrollElement, sliderConfig)

  // Set scroll position.
  // setScrollPosition(startPosition)

  // Set listener on the new dots.
  setListenersToTheDots(coralScrollElement, sliderConfig)

  sliderElement.classList.remove('js-updating-slides')
}