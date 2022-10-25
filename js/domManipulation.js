//Dom manipulation
console.log("domManipulation loaded")

let menu = document.getElementById('menu')
let menuButtonContainer = document.getElementById('menu-button-container')
let navbar = document.getElementsByClassName('navbar')[0]
let copyrightYear = document.getElementById('copyright-year')

// Show, hide menu on hamburger click
menuButtonContainer.addEventListener('click', () => toggleClass(menu, 'show'), false)
function toggleClass(element, clName) {
  element.classList.toggle(clName)
}

//Hide navbar then scrolling down
let lastScrollPosition = 0;
document.addEventListener('scroll', (e) => toggleNavbarAll(e))
function toggleNavbarAll(event) {
  //console.log("event listener added")
  let newScrollPosition = window.scrollY
  //console.log(newScrollPosition)
  let className = "navbar-hide"
  if (newScrollPosition < lastScrollPosition) {
    // Show if scrolling up and hidden
    if (navbar.classList.contains(className)) {
      menu.style.transform = "scale(1, 1)"

      navbar.classList.remove(className)
    }
  }
  else {
    // Hide if scrolling down and shown
    if (!navbar.classList.contains(className)) {
      menu.style.transform = "scale(1, 0)"
      navbar.classList.add(className)
    }
  }
  lastScrollPosition = newScrollPosition;
}

// Dynamic copyright
let date = new Date()
let year = date.getFullYear()
console.log("year", year)
copyrightYear.innerHTML = year
