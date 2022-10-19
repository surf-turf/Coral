/**
 * Debounce function.
 *
 * @param {function} func
 * @param {number} timeout
 *
 * @returns
 */
export const debounce = (func, timeout = 300) => {
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
