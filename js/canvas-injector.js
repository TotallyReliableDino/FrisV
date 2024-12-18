const canvas = document.getElementById('canvas');
const injectButton = document.getElementById('injectButton');

function inject(value) {
  canvas.innerHTML = value; // Replace the content of the canvas with user-provided HTML
}

injectButton.addEventListener('click', () => {
  const userInput = prompt("Enter the HTML content you'd like to inject:");
  if (userInput) {
    inject(userInput);
  }
});
