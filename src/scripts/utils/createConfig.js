/**
 * Create slider config object.
 * 
 * @param {HTNLElement} coralScrollElement 
 * 
 * @returns {object} sliderConfig
 */
export const createSliderConfig = (coralScrollElement) => {
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  const firstSlideElement = sliderElement.querySelectorAll('.slide:not(.js-hidden)') ? sliderElement.querySelectorAll('.slide:not(.js-hidden)')[0] : null

  return {
    devMode: coralScrollElement.dataset.devMode ? coralScrollElement.dataset.devMode === 'true' : false,
    grabVelocity: coralScrollElement.dataset.grabVelocity || 100,
    // autoScrollDuration: coralScrollElement.dataset.autoScroll,
    // enableThumbs: coralScrollElement.dataset.thumbs ? true : false,
    // infinite: coralScrollElement.dataset.infiniteScroll === 'true' ? true : false,
    snapAlignStyle: firstSlideElement ? getComputedStyle(firstSlideElement)['scroll-snap-align'] : null,
    // pauseOnHover: coralScrollElement.dataset.pauseOnHover === 'false' ? false : true, // Set default to true
    startPositionId: coralScrollElement.dataset.startPositionId,
  }
}