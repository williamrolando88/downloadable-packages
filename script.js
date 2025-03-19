document.addEventListener('DOMContentLoaded', function () {
  // Get references to elements
  const container = document.getElementById('elements-container');
  const addOneBtn = document.getElementById('add-one');
  const addThreeBtn = document.getElementById('add-three');
  const addNineBtn = document.getElementById('add-nine');
  const shapeButtons = document.querySelectorAll('.shape-btn');
  const colorButtons = document.querySelectorAll('.color-btn');

  // Function to create a single element
  function createElement() {
    const element = document.createElement('div');
    element.className = 'element-style';
    element.textContent = 'Element';
    return element;
  }

  // Function to add elements to the container
  function addElements(count) {
    // Clear existing content
    container.innerHTML = '';

    // Add new elements
    for (let i = 0; i < count; i++) {
      container.appendChild(createElement());
    }
  }

  // Event listeners for the add buttons
  addOneBtn.addEventListener('click', function () {
    addElements(1);
  });

  addThreeBtn.addEventListener('click', function () {
    addElements(3);
  });

  addNineBtn.addEventListener('click', function () {
    addElements(9);
  });

  // Event listeners for shape buttons
  shapeButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Remove all shape classes
      container.classList.remove('circle', 'square', 'triangle');

      // Add the selected shape class
      const shape = this.getAttribute('data-shape');
      container.classList.add(shape);
    });
  });

  // Event listeners for color buttons
  colorButtons.forEach(button => {
    button.addEventListener('click', function () {
      // Remove all color classes
      container.classList.remove('red', 'blue', 'green');

      // Add the selected color class
      const color = this.getAttribute('data-color');
      container.classList.add(color);
    });
  });
});