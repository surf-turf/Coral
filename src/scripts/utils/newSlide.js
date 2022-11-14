import { debounce } from './debounce'
import { setActiveIndicator } from './indicators'
import { setActiveSlideClass } from './setActiveSlideClass'
import { getCurrentSliderStates } from './getCurrentSliderStates'

/**
 * Handle set new slide active. (with a debouncer)
 */
export const handleSetNewSlide = debounce((coralScrollElement, sliderConfig) => {
  const currentSliderStates = getCurrentSliderStates(coralScrollElement, sliderConfig)

  setActiveSlideClass(coralScrollElement, currentSliderStates?.activeSlide)

  // if (thumbsParentElement) {
  //   const newActiveSlideId = getSlideIdByPosition(activeSlide.activeSlide)

  //   setActiveThumb(newActiveSlideId)
  // }

  // Set active indicator.
  setActiveIndicator(coralScrollElement, currentSliderStates?.activeSlide)

  // if (sliderConfig.infinite === true) {
  //   setClonesOfSlideForInifiteScroll()
  // }
}, 100)