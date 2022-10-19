
import { debounce } from './utils/debounce'
import { setDevMode } from './utils/dev-mode'

class CoralScroll extends HTMLElement {
  constructor() {
    super()

    const CoralScrollElement = this
    const sliderElement = CoralScrollElement.querySelector('.coral-scroll__slider')
    const firstSlideElement = sliderElement.querySelectorAll('.slide:not(.js-hidden)') ? sliderElement.querySelectorAll('.slide:not(.js-hidden)')[0] : null
    const grabOverlayElement = CoralScrollElement.querySelector('.coral-scroll__grab-overlay')
    const thumbsString = CoralScrollElement.dataset.thumbs
    const thumbsParentElement = thumbsString ? document.querySelector('.is-thumbs-element') : null
    const indicatorElement = CoralScrollElement.querySelector('.coral-scroll__indicator')
    const arrowsElement = CoralScrollElement.querySelector('.coral-scroll__arrows')
    let intervalPaused = false
    let isDown = false
    let startX
    let showOverlay

    // Options for the observer (which mutations to observe
    const config = {
      attributes: false,
      childList: true,
      subtree: false,
    }

    // Config for this slider.
    const sliderConfig = {
      devMode: CoralScrollElement.dataset.devMode ? CoralScrollElement.dataset.devMode === 'true' : false,
      grabVelocity: CoralScrollElement.dataset.grabVelocity || 100,
      autoScrollDuration: CoralScrollElement.dataset.autoScroll,
      enableThumbs: CoralScrollElement.dataset.thumbs ? true : false,
      infinite: CoralScrollElement.dataset.infiniteScroll === 'true' ? true : false,
      snapAlignStyle: firstSlideElement ? getComputedStyle(firstSlideElement)['scroll-snap-align'] : null,
      pauseOnHover: CoralScrollElement.dataset.pauseOnHover === 'false' ? false : true, // Set default to true
    }

    /**
     * Update slider config with new slides.
     */
    const updateSliderConfig = () => {
      const refreshedFirstSlideElement = sliderElement.querySelectorAll('.slide:not(.js-hidden)') ? sliderElement.querySelectorAll('.slide:not(.js-hidden)')[0] : null
      sliderConfig.snapAlignStyle = refreshedFirstSlideElement ? getComputedStyle(refreshedFirstSlideElement)['scroll-snap-align'] : null

      if (sliderConfig.devMode) {
        setDevMode(sliderConfig, CoralScrollElement)
      }
    }

    if (sliderConfig.devMode) {
      if (sliderConfig.snapAlignStyle === 'end') {
        console.warn('Snap align style is set to end. This is currently not supported.')
      }

      window.addEventListener('resize', setDevMode)

      // Initial load
      setDevMode(sliderConfig, CoralScrollElement)
    }

    const createDotElement = (index) => `<div class="dot" data-index="${index}"></div>`

    /**
     * Set active thumb based on active slide.
     *
     * @param {number} activeSlidePostion 
     */
    const setActiveThumb = debounce((activeSlidePostion) => {
      if (thumbsParentElement) {
        const allThumbsElement = thumbsParentElement.querySelectorAll('.slide')

        allThumbsElement.forEach((thumbElement) => {
          if (thumbElement.getAttribute('id') == activeSlidePostion) {
            thumbElement.classList.add('js-active')
          } else {
            thumbElement.classList.remove('js-active')
          }
        })
      }
    }, 100)

    /**
     * Set active indicator
     */
    const setActiveIndicator = (activeSlidePostion) => {
      if (indicatorElement) {
        const allIndicatorDots = indicatorElement.querySelectorAll('.dot')
        const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
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

    const setScrollPositionWithoutScroll = debounce((activeSlidePostion) => {
      const allSlidePositions = getCurrentSlideInView().allSlideWidths

      if (activeSlidePostion >= 0) {
        const allSlideWidthsBeforeActiveSlide = allSlidePositions.map((slideWidth, index) => {
          if (index <= (activeSlidePostion - 1)) {
            return slideWidth
          }
        }).filter((slideWidth) => slideWidth)

        const startingPosition = 0
        const activeSlidePosition = allSlideWidthsBeforeActiveSlide?.reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          startingPosition,
        )

        setActiveSlideClass(activeSlidePostion)

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
    const setScrollPosition = debounce((activeSlidePostion) => {
      const allSlidePositions = getCurrentSlideInView().allSlideWidths

      if (activeSlidePostion >= 0) {
        const allSlideWidthsBeforeActiveSlide = allSlidePositions.map((slideWidth, index) => {
          if (index <= (activeSlidePostion - 1)) {
            return slideWidth
          }
        }).filter((slideWidth) => slideWidth)

        const startingPosition = 0
        const activeSlidePosition = allSlideWidthsBeforeActiveSlide?.reduce(
          (previousValue, currentValue) => previousValue + currentValue,
          startingPosition,
        )

        setActiveSlideClass(activeSlidePostion)

        sliderElement.scrollTo({
          top: 0,
          left: activeSlidePosition,
          behavior: 'smooth',
        })
      }
    }, 10)

    /**
     * Set styling arrows.
     */
    const setStylingArrows = () => {
      const previousArrow = arrowsElement?.querySelector('.previous')
      const nextArrow = arrowsElement?.querySelector('.next')
      const currentSlide = getCurrentSlideInView()

      // Loop over all slides and
      if (previousArrow) {
        if (currentSlide.activeSlide == 0) {
          previousArrow.classList.add('js-disabled')
        } else {
          previousArrow.classList.remove('js-disabled')
        }

        previousArrow.addEventListener('click', handlePreviousSlide)
      }

      if (nextArrow) {
        if (currentSlide.isSlideTheLastSlide === true) {
          nextArrow.classList.add('js-disabled')
        } else {
          nextArrow.classList.remove('js-disabled')
        }

        nextArrow.addEventListener('click', handleNextSlide)
      }
    }

    /**
     * Get position of slide by id.
     * 
     * @param {string} slideId 
     * 
     * @returns {number}
     */
    const getPositionOfSlideById = (slideId) => {
      const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
      const arrayOfAllSlideElements = [...allSlideElements]
      const indexOfNewSlide = arrayOfAllSlideElements.findIndex((slideElement) => slideElement.getAttribute('id') == slideId)

      return indexOfNewSlide
    }

    /**
     * Set new dots.
     */
    const setNewDots = debounce(() => {
      if (indicatorElement) {
        sliderElement.classList.add('js-updating-slides')
        const allSlidesInScroll = sliderElement.querySelectorAll('.slide:not(.js-hidden):not(.js-clone)')
        const arrayAllSlidesInScroll = [...allSlidesInScroll]
        const startPositionId = CoralScrollElement.dataset.startPositionId || 0

        // Clear all the dots.
        indicatorElement.innerHTML = ''

        // Set new dots in indicator element.
        arrayAllSlidesInScroll.map((slide, index) => {
          indicatorElement.insertAdjacentHTML('beforeEnd', createDotElement(index))
        })

        // Get position of start position id.

        const startPosition = getPositionOfSlideById(startPositionId)

        handleSetNewSlide()
        setScrollPosition(startPosition)
        setStylingArrows(startPosition)
        sliderElement.classList.remove('js-updating-slides')
      }
    }, 10)

    /**
     * Handle click on thumbs or dots.
     * 
     * @param {*} event 
     */
    const handleClickNewActiveSlide = (event) => {
      const thumbElement = event.target.closest('.slide')
      const dotElement = event.target.closest('.dot')
      let newActiveSlideIndex = 0

      if (thumbElement) {
        const newActiveSlideId = thumbElement.getAttribute('id')
        newActiveSlideIndex = getPositionOfSlideById(newActiveSlideId)

        setActiveThumb(newActiveSlideId)
      }

      if (dotElement) {
        newActiveSlideIndex = dotElement.dataset.index
      }

      setActiveIndicator(newActiveSlideIndex)
      setScrollPosition(newActiveSlideIndex)
      setStylingArrows(newActiveSlideIndex)
    }

    const getSlideIdByPosition = (position) => {
      const allSlidesInScroll = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
      const arrayAllSlidesInScroll = [...allSlidesInScroll]

      return arrayAllSlidesInScroll[position]?.getAttribute('id')
    }

    const setActiveSlideClass = (activePosition) => {
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

    /**
     * Handle set new slide active. (with a debouncer)
     */
    const handleSetNewSlide = debounce(() => {
      const activeSlide = getCurrentSlideInView()

      setActiveSlideClass(activeSlide.activeSlide)

      if (thumbsParentElement) {
        const newActiveSlideId = getSlideIdByPosition(activeSlide.activeSlide)

        setActiveThumb(newActiveSlideId)
      }

      if (indicatorElement) {
        setActiveIndicator(activeSlide.activeSlide)
      }

      if (sliderConfig.infinite === true) {
        setClonesOfSlideForInifiteScroll()
      }
    }, 100)

    /**
     * Handle set new slide active. (with a debouncer)
     */
    const handleScroll = debounce(() => {
      const currentSlide = getCurrentSlideInView()

      // Reset scroll duration so it doen't awkwardly scrolls to the next slide after you slided to the previous slide 1 second ago.
      intervalPaused = true

      setActiveSlideClass(currentSlide.activeSlide)

      if (thumbsParentElement) {
        const newActiveSlideId = getSlideIdByPosition(currentSlide.activeSlide)

        setActiveThumb(newActiveSlideId)
      }

      if (indicatorElement) {
        setActiveIndicator(currentSlide.activeSlide)
      }

      if (arrowsElement) {
        setStylingArrows(currentSlide.activeSlide)
      }

      if (currentSlide.isSlideTheSecondLastSlide) {
        if (sliderConfig.infinite === true) {
          const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
          const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
          const activeSlide = arrayOfAllSlideElements[currentSlide.activeSlide]
          const cloneId = activeSlide?.dataset.cloneId

          setScrollPositionWithoutScroll(Number(cloneId))
        }
      } else if (currentSlide.isSlideTheLastSlide) {
        if (sliderConfig.infinite === true) {
          const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
          const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
          const activeSlide = arrayOfAllSlideElements[currentSlide.activeSlide]
          const cloneId = activeSlide?.dataset.cloneId

          setScrollPositionWithoutScroll(Number(cloneId))
        }
      }
    }, 50)

    /**
     * Get total slides in view.
     * 
     * @returns {number} total slides in view
     */
    const getTotalSlidesInView = () => {
      const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
      const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
      const viewportWidth = window.innerWidth
      const scrollPositionLeft = sliderElement.scrollLeft
      const sliderElementPaddingLeft = getComputedStyle(sliderElement)['paddingLeft']
      const paddingLeftValue = sliderElementPaddingLeft.replace('px', '')
      const sliderElementGap = getComputedStyle(sliderElement)['gap']
      const sliderGapValue = sliderElementGap.replace('px', '')
      const scrollAbleWindow = viewportWidth - (scrollPositionLeft >= paddingLeftValue ? 0 : paddingLeftValue)
      let totalSlidesInView = 0

      // Loop over all slides and check if they are in view of not. If they are add 1 to totalSlidesInView.
      arrayOfAllSlideElements.reduce(
        (previousValue, currentValue) => {
          const halfOfSlide = currentValue.clientWidth / 2
          if ((previousValue - halfOfSlide) >= 0) {
            totalSlidesInView++

            return previousValue - currentValue.clientWidth - sliderGapValue
          }

          return previousValue
        },
        scrollAbleWindow,
      )

      return totalSlidesInView
    }

    /**
     * Get current slide in view.
     * 
     * @returns {number} activeSlide
     */
    const getCurrentSlideInView = () => {
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

    /**
     * Callback for when the mutation observer is fired.
     */
    const callback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          // Update amount of dots.
          setNewDots()
          updateSliderConfig()
          // setSlidesInThumbElements()
        }
      }
    }

    const setClonesOfSlideForInifiteScroll = () => {
      if (sliderConfig.infinite === true) {
        if (sliderElement.dataset.clonesActive !== 'true') {
          const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden):not(.js-clone)')
          const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null

          sliderElement.dataset.clonesActive = 'true'
          arrayOfAllSlideElements.map((slideElement, index) => {
            const cloneSlide = slideElement.cloneNode(true)
            cloneSlide.classList.add('js-clone')
            cloneSlide.dataset.cloneId = index

            sliderElement.insertAdjacentElement('beforeend', cloneSlide)
            slideElement.dataset.slideId = index
          })
        }
      }
    }

    /**
     * Handle previous slide.
     */
    const handlePreviousSlide = () => {
      const currentSlide = getCurrentSlideInView()
      let newSlide = currentSlide.activeSlide

      if (currentSlide === 0) {
        newSlide = 0
      } else {
        newSlide -= 1
      }

      setActiveThumb(newSlide)
      setActiveIndicator(newSlide)
      setScrollPosition(newSlide)
      setStylingArrows(newSlide)
    }

    /**
     * Handle next slide.
     */
    const handleNextSlide = () => {
      const currentSlide = getCurrentSlideInView()
      const totalSlides = sliderElement.querySelectorAll('.slide:not(.js-hidden)')

      let newSlide = currentSlide.activeSlide

      if (currentSlide.isSlideTheSecondLastSlide) {
        if (sliderConfig.autoScrollDuration) {
          if (sliderConfig.infinite === true) {
            const allSlideElements = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
            const arrayOfAllSlideElements = allSlideElements ? [...allSlideElements] : null
            const activeSlide = arrayOfAllSlideElements[newSlide]
            const cloneId = activeSlide?.dataset.cloneId

            setScrollPositionWithoutScroll(Number(cloneId))

            newSlide = Number(cloneId) + 1

            // newSlide = 0
          } else {
            newSlide = 0
          }
        } else {
          newSlide = totalSlides.length - 1
        }
      } else {
        newSlide += 1
      }

      setActiveThumb(newSlide)
      setActiveIndicator(newSlide)
      setScrollPosition(newSlide)
      setStylingArrows(newSlide)
    }

    /**
     * Set event listeners.
     */
    const setEventListeners = () => {
      if (thumbsParentElement) {
        const allThumbsElement = thumbsParentElement.querySelectorAll('.slide')

        allThumbsElement.forEach((thumbElement) => {
          thumbElement.addEventListener('click', handleClickNewActiveSlide)
        })
      }

      if (indicatorElement) {
        const allIndicatorDots = indicatorElement.querySelectorAll('.dot')

        allIndicatorDots.forEach((dotElement) => {
          dotElement.addEventListener('click', handleClickNewActiveSlide)
        })
      }

      if (arrowsElement) {
        const previousArrow = arrowsElement.querySelector('.previous')
        const nextArrow = arrowsElement.querySelector('.next')

        if (previousArrow) {
          previousArrow.addEventListener('click', handlePreviousSlide)
        }

        if (nextArrow) {
          nextArrow.addEventListener('click', handleNextSlide)
        }
      }
    }

    // Initial load of the slider.
    handleSetNewSlide()

    // set listener for scroll event on the slider.
    sliderElement.addEventListener('scroll', handleScroll)

    // When enabled pause auto scroll when mouse is on slider.
    if (sliderConfig.pauseOnHover) {
      sliderElement.addEventListener('mouseenter', () => {
        // Reset scroll duration so it doen't awkwardly scrolls to the next slide after you slided to the previous slide 1 second ago.
        intervalPaused = true
      })

      sliderElement.addEventListener('mousemove', () => {
        // Reset scroll duration so it doen't awkwardly scrolls to the next slide after you slided to the previous slide 1 second ago.
        intervalPaused = true
      })
    }

    sliderElement.addEventListener('mousedown', () => {
      showOverlay = true
    })

    sliderElement.addEventListener('mousemove', (event) => {
      if (showOverlay) {
        grabOverlayElement?.classList.add('js-active')
        const mouseEvent = new MouseEvent('mousedown', event)

        grabOverlayElement?.dispatchEvent(mouseEvent)
      }
    })

    sliderElement.addEventListener('mouseup', () => {
      const mouseEvent = new MouseEvent('mouseup')
      grabOverlayElement?.classList.remove('js-active')

      grabOverlayElement?.dispatchEvent(mouseEvent)

      showOverlay = false
    })

    if (grabOverlayElement) {
      grabOverlayElement.addEventListener('mousedown', (event) => {
        const allSlidesInScroll = sliderElement.querySelectorAll('.slide:not(.js-hidden)')
        const arrayAllSlidesInScroll = [...allSlidesInScroll]

        isDown = true
        sliderElement.classList.add('js-active')
        startX = event.pageX - sliderElement.offsetLeft

        arrayAllSlidesInScroll.map(slideElement => {
          slideElement.ondragstart = function () {
            return false
          }
        })
      })

      const handleMouseUpAndOut = () => {
        isDown = false
        grabOverlayElement.classList.remove('js-active')
        showOverlay = false

        setTimeout(() => {
          sliderElement.classList.remove('js-active')
        }, 1000)
      }

      grabOverlayElement.addEventListener('mouseup', (event) => handleMouseUpAndOut(event))
      grabOverlayElement.addEventListener('mousemove', (event) => {
        if (!isDown) return
        event.preventDefault()

        const currentSlide = getCurrentSlideInView()
        const x = event.pageX - sliderElement.offsetLeft
        const walk = x - startX //scroll-fast

        if (walk >= -sliderConfig.grabVelocity && walk <= 0) {
          setScrollPosition(currentSlide.activeSlide + 1)
        }

        if (walk >= sliderConfig.grabVelocity && walk >= 0) {
          setScrollPosition(currentSlide.activeSlide - 1)
        }
      })
    }

    // For mobile devices.
    sliderElement.addEventListener('touchstart', handleScroll)

    setTimeout(() => {
      setEventListeners()
      setNewDots()
    }, 300)

    // Handles auto scroll event.
    if (sliderConfig.autoScrollDuration) {
      setInterval(() => {
        if (intervalPaused) {
          // Wait a round.
          intervalPaused = false
        } else {
          handleNextSlide()

          intervalPaused = false
        }

      }, Number(sliderConfig.autoScrollDuration))
    }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback)

    // Start observing the target node for configured mutations
    observer.observe(sliderElement, config)
  }
}

// Check if element is defined, if not define it..
// eslint-disable-next-line no-undefined
if (customElements.get('coral-scroll') === undefined) {
  customElements.define('coral-scroll', CoralScroll)
}
