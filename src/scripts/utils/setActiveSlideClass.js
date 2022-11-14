/**
 * Set active slide class.
 * 
 * @param {HTMLElement} coralScrollElement 
 * @param {Number} activePosition 
 */
export const setActiveSlideClass = (coralScrollElement, activePosition) => {
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
  const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null

  if (activePosition === null) return

  arrayOfAllSlideElements.map((slideElement) => {
    slideElement.classList.remove('js-active')
  })

  if (arrayOfAllSlideElements.length > 0) {
    arrayOfAllSlideElements[Number(activePosition)].classList.add('js-active')
  }
}