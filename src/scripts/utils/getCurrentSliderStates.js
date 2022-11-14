/**
 * Get current slide in view.
 * 
 * @returns {number} activeSlide
 */
export const getCurrentSliderStates = (coralScrollElement, sliderConfig) => {
  if (!coralScrollElement) return null

  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
  const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
  const sliderElementPaddingLeft = getComputedStyle(sliderElement)['paddingLeft']
  const paddingLeftValue = sliderElementPaddingLeft.replace('px', '')
  const sliderElementGap = getComputedStyle(sliderElement)['gap']
  const sliderGapValue = sliderElementGap?.split(' ') ? sliderElementGap?.split(' ')[0].replace('px', '') : sliderElementGap?.replace('px', '')
  const widthOfSliderElement = sliderElement.getBoundingClientRect().width
  const totalSlidesNumber = arrayOfAllSlideElements.length

  // Get the base position which will set the active slide, using the left offset of the slider element.
  const activePosition = Number(sliderElement.getBoundingClientRect().left) + Number(paddingLeftValue)

  // 0 is the active slide.
  const currentSlidePositions = arrayOfAllSlideElements.map((slideElement) => {
    const offsetLeft = slideElement.getBoundingClientRect().x
    const widthImage = slideElement.getBoundingClientRect().width

    switch (sliderConfig.snapAlignStyle) {
      case 'start':
        return Number(offsetLeft) - Number(activePosition)

      case 'center':
        return Number(offsetLeft) - Number(activePosition) + Number(widthImage / 2)

      // case 'end':
      //   return viewportWidth - offsetLeft - widthImage

      default:
        return (offsetLeft)
    }
  })

  const slidePositionsWithWidth = arrayOfAllSlideElements.map((slideElement) => {
    const offsetLeft = slideElement.getBoundingClientRect().x
    const widthImage = slideElement.getBoundingClientRect().width

    return Number(offsetLeft) + Number(widthImage)
  })

  const originalSlidePositions = arrayOfAllSlideElements.map((slideElement, index) => {
    const widthImage = slideElement.getBoundingClientRect().width

    if (index === totalSlidesNumber) {
      return Number(widthImage)
    }

    return Number(widthImage) + Number(sliderGapValue.match(/^[0-9]+$/) ? sliderGapValue : 0)
  })

  // // Find the index aka the active slide that's closest to 0
  if (currentSlidePositions.length > 0) {
    const closestActiveSlide = currentSlidePositions?.reduce((prev, curr) => Math.abs(curr - 0) < Math.abs(prev - 0) ? curr : prev)
    const indexOfClosestActiveSlide = currentSlidePositions?.findIndex((slidePosition) => slidePosition === closestActiveSlide)
    const sliderElementPaddingLeft = getComputedStyle(sliderElement)['paddingRight']
    const paddingRightValue = sliderElementPaddingLeft.replace('px', '')
    const lastSlidePosition = Math.ceil(slidePositionsWithWidth[totalSlidesNumber - 1])
    const isSecondLastSlide = indexOfClosestActiveSlide === Number(totalSlidesNumber) - 2
    let isLastSlide = null

    switch (sliderConfig.snapAlignStyle) {
      case 'start':
        isLastSlide = Number(lastSlidePosition) + Number(paddingRightValue) <= (Number(widthOfSliderElement) + 10) && Number(lastSlidePosition) + Number(paddingRightValue) >= (Number(widthOfSliderElement) - 10)
        break

      case 'center':
        isLastSlide = lastSlidePosition - paddingRightValue === widthOfSliderElement / 2
        break

      // case 'end':
      //   isLastSlide = lastSlidePosition < 10 && lastSlidePosition > -10
      //   break

      default:
        isLastSlide = lastSlidePosition === widthOfSliderElement
        break
    }
    // return indexOfClosestActiveSlide || 0
    const returnObject = {
      // activePosition: activePosition,
      allSlideWidths: originalSlidePositions, // Including gap.
      currentSlidePositions: currentSlidePositions,
      // totalSlidesInView: totalSlidesInView,
      activeSlide: indexOfClosestActiveSlide,
      isSlideTheSecondLastSlide: isSecondLastSlide,
      isSlideTheLastSlide: isLastSlide,
    }

    if (sliderConfig.devMode) {
      console.log(returnObject)
    }

    return returnObject
  }

  return 0
}