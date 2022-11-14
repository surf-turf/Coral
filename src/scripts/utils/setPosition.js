import { debounce } from './debounce'
import { getCurrentSliderStates } from './getCurrentSliderStates'
import { setActiveSlideClass } from './setActiveSlideClass'

/**
 * Set scroll position without scrolling.
 */
export const setScrollPositionWithoutScroll = debounce((coralScrollElement, sliderConfig, activeSlidePostion) => {
  const currentSliderStates = getCurrentSliderStates(coralScrollElement, sliderConfig)
  const allSlidePositions = currentSliderStates?.allSlideWidths
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')

  if (activeSlidePostion >= 0) {
    const allSlideWidthsBeforeActiveSlide = allSlidePositions?.map((slideWidth, index) => {
      if (index <= (activeSlidePostion - 1)) {
        return slideWidth
      }
    }).filter((slideWidth) => slideWidth)

    const startingPosition = 0
    const activeSlidePosition = allSlideWidthsBeforeActiveSlide?.reduce(
      (previousValue, currentValue) => previousValue + currentValue,
      startingPosition,
    )

    setActiveSlideClass(coralScrollElement, activeSlidePostion)

    sliderElement.scrollTo({
      top: 0,
      left: activeSlidePosition,
      behavior: 'instant',
    })
  }
}, 10)

/**
 * Set scroll position.
 * 
 * @param {number} activeSlidePostion 
 */
export const setScrollPosition = debounce((coralScrollElement, sliderConfig, activeSlidePostion) => {
  const currentSliderStates = getCurrentSliderStates(coralScrollElement, sliderConfig)
  const allSlidePositions = currentSliderStates?.allSlideWidths
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')

  if (activeSlidePostion >= 0) {
    const allSlideWidthsBeforeActiveSlide = allSlidePositions?.map((slideWidth, index) => {
      if (index <= (activeSlidePostion - 1)) {
        return slideWidth
      }
    }).filter((slideWidth) => slideWidth)

    const startingPosition = 0
    const activeSlidePosition = allSlideWidthsBeforeActiveSlide?.reduce(
      (previousValue, currentValue) => previousValue + currentValue,
      startingPosition,
    )

    setActiveSlideClass(coralScrollElement, activeSlidePostion)

    sliderElement.scrollTo({
      top: 0,
      left: activeSlidePosition,
      behavior: 'smooth',
    })
  }
}, 10)