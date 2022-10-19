/**
* Set dev mode.
*/
export const setDevMode = (sliderConfig, coralScrollElement) => {
  const sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
  let sliderElementPaddingLeft = null
  let sliderElementPaddingRight = null

  if (sliderConfig.snapAlignStyle === 'start') {
    // Default is being used.
    sliderElementPaddingLeft = getComputedStyle(sliderElement)['paddingLeft']
    sliderElementPaddingRight = getComputedStyle(sliderElement)['paddingRight']
  } else if (sliderConfig.snapAlignStyle === 'center') {
    sliderElementPaddingLeft = '50%'
    sliderElementPaddingRight = getComputedStyle(sliderElement)['paddingRight']
  }

  // Show the start and end point.
  coralScrollElement.classList.add('js-dev-mode')
  coralScrollElement.querySelector('.js-dev-start-line')?.remove()
  coralScrollElement.querySelector('.js-dev-end-line')?.remove()

  // Insert start and end line.
  coralScrollElement.insertAdjacentHTML('afterBegin', `<div style="position:absolute;z-index:50;left:${sliderElementPaddingLeft};width:3px;height:100px;background-color:blue" class="js-dev-start-line"></div><div style="position:absolute;z-index:50;right:${sliderElementPaddingRight};width:3px;height:100px;background-color:red" class="js-dev-end-line"></div>`)
}
