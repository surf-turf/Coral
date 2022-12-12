/**
 * Coral Scroll Core
 */
export class CoralScrollCore {
  constructor(coralScrollElement) {
    this.coralScrollElement = coralScrollElement
    this.sliderElement = coralScrollElement.querySelector('.coral-scroll__slider')
    this.grabOverlayElement = coralScrollElement.querySelector('.coral-scroll__grab-overlay')
    this.sliderConfig = this.createSliderConfig()
    this.slideScrollLeft = this.sliderElement.scrollLeft
    this.showOverlay = false
    this.isDown = false
    this.startX
    this.initializeSlider()
    this.oberserverConfig = {
      attributes: false,
      childList: true,
      subtree: false,
    }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(this.callback)

    // Start observing the target node for configured mutations
    observer.observe(this.coralScrollElement, this.oberserverConfig)
  }

  /**
   * Create a dot element.
   * 
   * @param {Number} index 
   * @returns 
   */
  #createDotElement = (index) => `<button type="button" class="dot" data-index="${index}" aria-label="Select slide ${index}" name="Select slide ${index}"></button>`

  /**
   * Send event scrolled to new slide
   * @param {number} newSlide 
   */
  sendEventScrolledToNewSlide = (newSlide) => {
    const event = new CustomEvent('scrolled-to-slide', {
      detail: {
        activeSlide: newSlide,
      },
    })

    document.dispatchEvent(event)
  }

  /**
   * Debounce function.
   *
   * @param {function} func
   * @param {number} timeout
   *
   * @returns
   */
  debounce = (func, timeout = 50) => {
    let timer

    return (...args) => {
      // Clear previous set timer.
      clearTimeout(timer)

      // Set timer and perform function when timer runs out.
      timer = setTimeout(() => {
        func.apply(this, args)
      }, timeout)
    }
  }

  /**
 * Create slider config object.
 * 
 * @returns {object} sliderConfig
 */
  createSliderConfig = () => {
    const firstSlideElement = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)') ? this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')[0] : null

    return {
      devMode: this.coralScrollElement.dataset.devMode ? this.coralScrollElement.dataset.devMode === 'true' : false,
      grabVelocity: this.coralScrollElement.dataset.grabVelocity || 100,
      // autoScrollDuration: coralScrollElement.dataset.autoScroll,
      enableThumbs: this.coralScrollElement.dataset.thumbs ? true : false,
      infinite: this.coralScrollElement.dataset.infiniteScroll === 'true' ? true : false,
      snapAlignStyle: firstSlideElement ? getComputedStyle(firstSlideElement)['scroll-snap-align'] : null,
      startPositionId: this.coralScrollElement.dataset.startPositionId,
    }
  }

  /**
   * Get current slide in view.
   * 
   * @returns {number} activeSlide
   */
  getCurrentSliderStates = () => {
    if (!this.sliderElement) return null

    const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
    const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
    const sliderElementPaddingLeft = getComputedStyle(this.sliderElement)['paddingLeft']
    const paddingLeftValue = sliderElementPaddingLeft.replace('px', '')
    const sliderElementGap = getComputedStyle(this.sliderElement)['gap']
    const sliderGapValue = sliderElementGap?.split(' ') ? sliderElementGap?.split(' ')[0].replace('px', '') : sliderElementGap?.replace('px', '')
    const widthOfSliderElement = this.sliderElement.getBoundingClientRect().width
    const totalSlidesNumber = arrayOfAllSlideElements.length

    // Get the base position which will set the active slide, using the left offset of the slider element.
    const activePosition = Number(this.sliderElement.getBoundingClientRect().left) + Number(paddingLeftValue)

    // 0 is the active slide.
    const currentSlidePositions = arrayOfAllSlideElements.map((slideElement) => {
      const offsetLeft = slideElement.getBoundingClientRect().x
      const widthImage = slideElement.getBoundingClientRect().width
      const sliderElementWidthWithPadding = this.sliderElement.getBoundingClientRect().width
      const sliderElementPaddingLeft = getComputedStyle(this.sliderElement)['paddingLeft']
      const paddingLeftValue = sliderElementPaddingLeft.replace('px', '')
      const sliderElementPaddingRight = getComputedStyle(this.sliderElement)['paddingRight']
      const paddingRightValue = sliderElementPaddingRight.replace('px', '')
      const sliderElementWidth = sliderElementWidthWithPadding - paddingLeftValue - paddingRightValue

      switch (this.sliderConfig.snapAlignStyle) {
        case 'start':
          return Number(offsetLeft) - Number(activePosition)

        case 'center':
          // return Number(sliderElementWidth / 2) - Number(offsetLeft) + Number(widthImage / 2)
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
      const sliderElementPaddingRight = getComputedStyle(this.sliderElement)['paddingRight']
      const paddingRightValue = sliderElementPaddingRight.replace('px', '')
      const lastSlidePosition = Math.ceil(slidePositionsWithWidth[totalSlidesNumber - 1])
      const isSecondLastSlide = indexOfClosestActiveSlide === Number(totalSlidesNumber) - 2
      let isLastSlide = null

      switch (this.sliderConfig.snapAlignStyle) {
        case 'start':
          isLastSlide = Number(lastSlidePosition) + Number(paddingRightValue) <= (Number(widthOfSliderElement) + 10) && Number(lastSlidePosition) + Number(paddingRightValue) >= (Number(widthOfSliderElement) - 10)
          break

        case 'center':
          isLastSlide = lastSlidePosition - paddingRightValue === widthOfSliderElement / 2
          break

        default:
          isLastSlide = lastSlidePosition === widthOfSliderElement
          break
      }

      // return indexOfClosestActiveSlide || 0
      const returnObject = {
        allSlideWidths: originalSlidePositions, // Including gap.
        currentSlidePositions: currentSlidePositions,
        activeSlide: indexOfClosestActiveSlide,
        isSlideTheSecondLastSlide: isSecondLastSlide,
        isSlideTheLastSlide: isLastSlide,
      }

      if (this.sliderConfig.devMode) {
        console.log(returnObject)
      }

      return returnObject
    }

    return 0
  }

  /**
   * Set active indicator
   */
  setActiveIndicator = (activeSlidePostion) => {
    const indicatorElement = this.coralScrollElement.querySelector('.coral-scroll__indicator')

    if (indicatorElement) {
      const allIndicatorDots = indicatorElement.querySelectorAll('.dot')
      const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
      const arrayOfAllSlideElements = [...allSlideElements]

      // Check if activeSlide is a clone.
      const slideElement = arrayOfAllSlideElements[activeSlidePostion]
      const isClone = slideElement?.classList.contains('js-clone')

      allIndicatorDots.forEach((dotElement) => {
        dotElement.classList.remove('js-active')

        if (isClone) {
          const cloneId = slideElement.dataset.cloneId
          const indexOfOriginalSlide = arrayOfAllSlideElements.findIndex((slideElement) => slideElement.dataset.slideId == cloneId)

          if (Number(dotElement.dataset.index) === Number(indexOfOriginalSlide)) {
            dotElement.classList.add('js-active')
          }
        } else {
          if (Number(dotElement.dataset.index) === Number(activeSlidePostion)) {
            dotElement.classList.add('js-active')
          }
        }
      })
    }
  }

  /**
   * Set active thumb
   */
  setActiveThumb = (activeSlidePostion) => {
    const closestSectionElement = this.sliderElement.closest('section')
    const allThumbsParentElements = closestSectionElement.querySelectorAll('.is-thumbs-element')

    if (allThumbsParentElements.length >= 0) {
      allThumbsParentElements.forEach((thumbsParentElement) => {
        const allThumbsElement = thumbsParentElement.querySelectorAll('.slide')
        const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
        const arrayOfAllSlideElements = [...allSlideElements]

        // Check if activeSlide is a clone.
        const slideElement = arrayOfAllSlideElements[activeSlidePostion]
        const isClone = slideElement?.classList.contains('js-clone')

        allThumbsElement.forEach((thumbElement) => {
          thumbElement.classList.remove('js-active')

          if (isClone) {
            const cloneId = slideElement.dataset.cloneId
            const indexOfOriginalSlide = arrayOfAllSlideElements.findIndex((slideElement) => slideElement.dataset.slideId == cloneId)

            if (Number(thumbElement.dataset.index) === Number(indexOfOriginalSlide)) {
              thumbElement.classList.add('js-active')
            }
          } else {
            if (Number(thumbElement.dataset.index) === Number(activeSlidePostion)) {
              thumbElement.classList.add('js-active')
            }
          }
        })
      })
    }
  }

  /**
 * Set active slide class.
 * 
 * @param {Number} activePosition 
 */
  setActiveSlideClass = (activePosition) => {
    const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
    const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null

    if (activePosition === null) return

    arrayOfAllSlideElements.map((slideElement) => {
      slideElement?.classList.remove('js-active')
    })

    if (arrayOfAllSlideElements.length > 0) {
      arrayOfAllSlideElements[Number(activePosition)].classList.add('js-active')
    }
  }

  /**
   * Set listnener arrows.
   */
  setListenerArrows = () => {
    const arrowsElement = this.coralScrollElement.querySelector('.coral-scroll__arrows')

    if (!arrowsElement) return null

    const previousArrow = arrowsElement?.querySelector('.previous')
    const nextArrow = arrowsElement?.querySelector('.next')

    previousArrow?.addEventListener('click', () => this.handlePreviousSlide())
    nextArrow.addEventListener('click', () => this.handleNextSlide())
  }

  /**
   * Set styling arrows.
   */
  setStylingArrows = () => {
    const arrowsElement = this.coralScrollElement.querySelector('.coral-scroll__arrows')

    if (!arrowsElement) return null

    const previousArrow = arrowsElement?.querySelector('.previous')
    const nextArrow = arrowsElement?.querySelector('.next')
    const currentSliderStates = this.getCurrentSliderStates()

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
   * Set scroll position without scrolling.
   */
  setScrollPositionWithoutScroll = (activeSlidePostion) => {
    const currentSliderStates = this.getCurrentSliderStates()
    const allSlidePositions = currentSliderStates?.allSlideWidths

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

      this.setActiveSlideClass(activeSlidePostion)

      this.sliderElement.scrollTo({
        top: 0,
        left: activeSlidePosition,
        behavior: 'instant',
      })
    }
  }

  /**
   * Set scroll position.
   * 
   * @param {number} activeSlidePostion 
   */
  setScrollPosition = (activeSlidePostion) => {
    const currentSliderStates = this.getCurrentSliderStates()
    const allSlidePositions = currentSliderStates?.allSlideWidths

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

      this.setActiveSlideClass(activeSlidePostion)

      this.sliderElement.scrollTo({
        top: 0,
        left: activeSlidePosition,
        behavior: 'smooth',
      })
    }
  }

  /**
   * Get position of slide by id.
   * 
   * @param {string} slideId 
   * 
   * @returns {number}
   */
  getPositionOfSlideById = (slideId) => {
    const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
    const arrayOfAllSlideElements = [...allSlideElements]
    const indexOfNewSlide = arrayOfAllSlideElements.findIndex((slideElement) => slideElement.dataset.deeplinkTarget == slideId)

    return indexOfNewSlide
  }

  /**
   * Handle click on thumbs or dots.
   * 
   * @param {*} event 
   */
  handleClickNewActiveSlide = (event) => {
    const thumbElement = event.target.closest('.slide')
    const dotElement = event.target.closest('.dot')
    let newActiveSlideIndex = 0

    if (thumbElement) {
      const newActiveSlideId = thumbElement.getAttribute('id')
      newActiveSlideIndex = this.getPositionOfSlideById(newActiveSlideId)
    }

    if (dotElement) {
      newActiveSlideIndex = dotElement.dataset.index
    }

    this.setActiveIndicator(newActiveSlideIndex)
    this.setActiveThumb(newActiveSlideIndex)
    this.setScrollPosition(newActiveSlideIndex)
    this.setStylingArrows(newActiveSlideIndex)
  }

  /**
   * add Listener to the new dots.
   */
  setListenersToTheDots = () => {
    const newIndicatorElement = this.coralScrollElement.querySelector('.coral-scroll__indicator')

    if (newIndicatorElement) {
      const allIndicatorDots = newIndicatorElement.querySelectorAll('.dot')
      const arrayOfAllIndicatorDots = [...allIndicatorDots]
      // Set event listener on dot.
      arrayOfAllIndicatorDots?.map((dotElement) => {
        dotElement.addEventListener('click', (event) => this.handleClickNewActiveSlide(event))
      })
    }
  }

  /**
   * add Listener to the new dots.
   */
  setListenersToThumbs = () => {
    if (this.sliderConfig.enableThumbs) {
      const closestSectionElement = this.sliderElement.closest('section')
      const thumbsParentElement = closestSectionElement.querySelector('.is-thumbs-element')

      if (thumbsParentElement) {
        const allThumbsElement = thumbsParentElement.querySelectorAll('.slide')
        const arrayOfAllThumbs = [...allThumbsElement]

        // Set event listener on thumb.
        arrayOfAllThumbs?.map((thumbElement) => {
          const newSlideIndex = thumbElement.dataset.index
          thumbElement.addEventListener('click', () => {
            this.setActiveIndicator(newSlideIndex)
            this.setActiveThumb(newSlideIndex)
            this.setScrollPosition(newSlideIndex)
            this.setStylingArrows(newSlideIndex)
          })
        })
      }
    }
  }

  /**
   * Update slides.
   */
  updateSlides = () => {
    this.sliderElement.classList.add('js-updating-slides')

    // Set new dots.
    this.setNewDots()

    // Set styling arrows.
    this.setStylingArrows()

    // Set clones of slide for infinite scroll.
    this.setClonesOfSlideForInifiteScroll()

    // Set listners to the new dots.
    this.setListenersToTheDots()

    this.sliderElement.classList.remove('js-updating-slides')
  }

  /**
   * Callback for when the mutation observer is fired.
   */
  callback = this.debounce((mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        this.updateSlides()
      }
    }
  }, 10)

  /**
   * Set new dots.
   */
  setNewDots = this.debounce(() => {
    const indicatorElement = this.coralScrollElement.querySelector('.coral-scroll__indicator')

    if (indicatorElement) {
      const allSlidesInScroll = this.sliderElement.querySelectorAll('.slide:not(.js-hidden):not(.js-clone)')
      const arrayAllSlidesInScroll = [...allSlidesInScroll]

      // Clear all the dots.
      indicatorElement.innerHTML = ''

      // Set new dots in indicator element.
      arrayAllSlidesInScroll.map((slide, index) => {
        indicatorElement.insertAdjacentHTML('beforeEnd', this.#createDotElement(index))
      })
    }
  }, 10)

  setClonesOfSlideForInifiteScroll = () => {
    if (this.sliderConfig.infinite === true) {
      if (this.sliderElement.dataset.clonesActive !== 'true') {
        const allSlideElements = this.sliderElement.querySelectorAll(
          '.slide:not(.js-hidden):not(.js-clone)',
        )
        const arrayOfAllSlideElements = allSlideElements
          ? [...allSlideElements]
          : null

        this.sliderElement.dataset.clonesActive = 'true'
        arrayOfAllSlideElements.map((slideElement, index) => {
          const cloneSlide = slideElement.cloneNode(true)
          cloneSlide.classList.add('js-clone')
          cloneSlide.dataset.cloneId = index

          this.sliderElement.insertAdjacentElement('beforeend', cloneSlide)
          slideElement.dataset.slideId = index
        })
      }
    }
  }

  /**
   * Handle previous slide.
   */
  handlePreviousSlide = () => {
    const currentSliderStates = this.getCurrentSliderStates()
    let newSlide = currentSliderStates?.activeSlide

    if (currentSliderStates?.activeSlide === 0) {
      newSlide = 0
    } else {
      newSlide -= 1
    }

    this.setActiveIndicator(newSlide)
    this.setActiveThumb(newSlide)
    this.setScrollPosition(newSlide)
    this.setStylingArrows(newSlide)

    // Send scrolled event.
    this.sendEventScrolledToNewSlide(newSlide)
  }

  /**
   * Handle next slide.
   */
  handleNextSlide = () => {
    const currentSliderStates = this.getCurrentSliderStates()
    let newSlide = currentSliderStates?.activeSlide

    if (currentSliderStates?.isSlideTheSecondLastSlide) {
      if (this.sliderConfig.infinite === true) {
        const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
        const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
        const activeSlide = arrayOfAllSlideElements[newSlide]
        const cloneId = activeSlide?.dataset.cloneId

        this.setScrollPositionWithoutScroll(Number(cloneId))

        newSlide = Number(cloneId) + 1

        // newSlide = 0
      } else {
        newSlide = 0
      }
    } else {
      newSlide += 1
    }

    this.setActiveIndicator(newSlide)
    this.setActiveThumb(newSlide)
    this.setScrollPosition(newSlide)
    this.setStylingArrows(newSlide)

    // Send new slide event.
    this.sendEventScrolledToNewSlide(newSlide)
  }

  /**
   * Handle set new slide active. (with a debouncer)
   */
  handleScroll = () => {
    const currentSlide = this.getCurrentSliderStates()

    this.setActiveSlideClass(currentSlide?.activeSlide)
    this.setActiveIndicator(currentSlide?.activeSlide)
    this.setScrollPosition(currentSlide?.activeSlide)
    this.setStylingArrows(currentSlide?.activeSlide)

    if (currentSlide.isSlideTheSecondLastSlide) {
      if (sliderConfig.infinite === true) {
        const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
        const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
        const activeSlide = arrayOfAllSlideElements[currentSlide.activeSlide]
        const cloneId = activeSlide?.dataset.cloneId

        this.setScrollPositionWithoutScroll(Number(cloneId))
      }
    } else if (currentSlide.isSlideTheLastSlide) {
      if (sliderConfig.infinite === true) {
        const allSlideElements = this.sliderElement.querySelectorAll('.slide:not(.js-hidden)')
        const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
        const activeSlide = arrayOfAllSlideElements[currentSlide.activeSlide]
        const cloneId = activeSlide?.dataset.cloneId

        this.setScrollPositionWithoutScroll(Number(cloneId))
      }
    }
  }

  /**
   * Initialize slider.
   */
  initializeSlider = () => {
    const activeSlide = this.sliderConfig.startPositionId || 0

    // Set the dots for indicator in the slider.
    this.setNewDots()

    // Set the first or dataset slide as active slide.
    this.setActiveSlideClass(activeSlide)

    // Set lisntener arrows.
    this.setListenerArrows()

    this.setClonesOfSlideForInifiteScroll()

    setTimeout(() => {
      // Set listener dots.
      this.setListenersToTheDots()

      // Set listener to thumbs
      this.setListenersToThumbs()

      // Set active indicator.
      this.setActiveIndicator(activeSlide)
    }, 50)

    this.sliderElement.addEventListener('scroll', this.debounce(() => {
      const currentSliderStates = this.getCurrentSliderStates()
      const newSlide = currentSliderStates?.activeSlide

      if (currentSliderStates === newSlide) {
        // Do nothing as it is the same active slide.
      } else {
        this.setActiveSlideClass(newSlide)
        this.setActiveIndicator(newSlide)
        this.setActiveThumb(newSlide)
        this.setStylingArrows(newSlide)
      }
    }), 0)

    // Mouse down shows the overlay.
    this.sliderElement.addEventListener('mousedown', () => {
      this.showOverlay = true
    })

    // Mousemove over the slider. When the overlay is visible it will trigger an mousedown event ob the graboverlay element.
    this.sliderElement.addEventListener('mousemove', (event) => {
      if (this.showOverlay) {
        this.grabOverlayElement?.classList.add('js-active')
        const mouseEvent = new MouseEvent('mousedown', event)

        this.grabOverlayElement?.dispatchEvent(mouseEvent)
      }
    })

    // This will stop the overlay from showing when the mouse is up.
    this.sliderElement.addEventListener('mouseup', () => {
      const mouseEvent = new MouseEvent('mouseup')
      this.grabOverlayElement?.classList.remove('js-active')

      this.grabOverlayElement?.dispatchEvent(mouseEvent)

      this.showOverlay = false
    })

    if (this.grabOverlayElement) {
      this.grabOverlayElement.addEventListener('mousedown', (event) => {
        const allSlidesInScroll = this.sliderElement.querySelectorAll(
          '.slide:not(.js-hidden)',
        )
        const arrayAllSlidesInScroll = [...allSlidesInScroll]

        this.isDown = true
        this.sliderElement.classList.add('js-active')
        this.startX = event.pageX - this.sliderElement.offsetLeft

        arrayAllSlidesInScroll.map((slideElement) => {
          slideElement.ondragstart = function () {
            return false
          }
        })
      })

      const handleMouseUpAndOut = () => {
        this.isDown = false
        this.grabOverlayElement.classList.remove('js-active')
        this.showOverlay = false

        setTimeout(() => {
          this.sliderElement.classList.remove('js-active')
        }, 1000)
      }

      this.grabOverlayElement.addEventListener('mouseup', (event) =>
        handleMouseUpAndOut(event),
      )

      this.grabOverlayElement.addEventListener('mousemove', (event) => {
        if (!this.isDown) return
        event.preventDefault()

        const currentSlide = this.getCurrentSliderStates()
        const x = event.pageX - this.sliderElement.offsetLeft
        const walk = x - this.startX //scroll-fast

        if (walk >= -this.sliderConfig.grabVelocity && walk <= 0) {
          this.setScrollPosition(
            currentSlide.activeSlide + 1,
          )
        }

        if (walk >= this.sliderConfig.grabVelocity && walk >= 0) {
          this.setScrollPosition(
            currentSlide.activeSlide - 1,
          )
        }
      })
    }
  }
}

export default CoralScrollCore