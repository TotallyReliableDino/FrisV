// Editor State
let selectedElement = null;
let elementData = [];

// Load Element Definitions
async function loadElementsJSON() {
  try {
    const response = await fetch('elements.json');
    if (!response.ok) throw new Error('Failed to fetch elements.json');
    elementData = await response.json();
    generateElementPanel();
    restoreCanvas();
  } catch (error) {
    console.error('Error loading JSON:', error);
  }
}

// Generate Element Panel
function generateElementPanel() {
  const elementPanel = document.querySelector('.element-panel');
  elementPanel.innerHTML = '';
  elementData.forEach((element) => {
    const button = document.createElement('button');
    button.textContent = element.label;
    button.addEventListener('click', () => addElementToCanvas(element));
    elementPanel.appendChild(button);
  });
}

// Add Element to Canvas
function addElementToCanvas(elementDef) {
  const canvas = document.querySelector('.canvas');
  const newElement = createCanvasElement(elementDef);
  canvas.appendChild(newElement);
  makeElementDraggable(newElement);  // Make the element draggable
}

// Create a Canvas Element
function createCanvasElement(elementDef, savedData = {}) {
  const element = document.createElement(elementDef.tag);
  element.className = 'canvas-element';
  element.draggable = true;
  element.dataset.id = savedData.id || crypto.randomUUID();
  element.innerHTML = elementDef.tag === 'img' ? '' : savedData.content || elementDef.defaultContent || '';
  element.style.cssText = savedData.styles || '';
  if (elementDef.tag === 'img') element.src = savedData.content || elementDef.defaultContent;

  // Apply positioning if available
  if (savedData.left) element.style.left = savedData.left;
  if (savedData.top) element.style.top = savedData.top;

  element.addEventListener('click', () => selectElement(element, elementDef));
  return element;
}

// Select Element for Editing
function selectElement(element, elementDef) {
  selectedElement = element;
  const editOptions = document.querySelector('.edit-options');
  editOptions.innerHTML = '';
  
  elementDef.settings.forEach((setting) => {
    const label = document.createElement('label');
    label.textContent = setting.name;

    const input = document.createElement(setting.type === 'color' ? 'input' : setting.inputType || 'input');
    input.type = setting.type || 'text';
    input.value = getElementValue(element, setting.target);
    
    input.addEventListener('input', () => updateElementValue(element, setting.target, input.value, setting.unit));
    editOptions.appendChild(label);
    editOptions.appendChild(input);
  });
}

// Get Element Value
function getElementValue(element, target) {
  if (target.includes('style')) {
    return element.style[target.split('.')[1]] || '';
  } else if (target === 'innerText') {
    return element.innerText;
  }
  return element[target] || '';
}

// Update Element Value
function updateElementValue(element, target, value, unit = '') {
  if (target.includes('style')) {
    element.style[target.split('.')[1]] = value + unit;
  } else if (target === 'innerText') {
    element.innerText = value;
  } else {
    element[target] = value;
  }

  // After updating, automatically save the canvas state
  saveCanvasState();
}

// Save Canvas State
function saveCanvasState() {
  const canvasElements = Array.from(document.querySelectorAll('.canvas-element')).map((element) => ({
    tag: element.tagName.toLowerCase(),
    content: element.tagName === 'IMG' ? element.src : element.innerText,
    styles: element.style.cssText,
    id: element.dataset.id,
    left: element.style.left,
    top: element.style.top
  }));
  localStorage.setItem('canvasData', JSON.stringify(canvasElements));
}

// Restore Canvas State
function restoreCanvas() {
  const savedCanvas = localStorage.getItem('canvasData');
  if (!savedCanvas) return;
  
  const canvas = document.querySelector('.canvas');
  const canvasData = JSON.parse(savedCanvas);
  
  canvasData.forEach((data) => {
    const elementDef = elementData.find((def) => def.tag === data.tag);
    if (elementDef) {
      const restoredElement = createCanvasElement(elementDef, data);
      canvas.appendChild(restoredElement);
      makeElementDraggable(restoredElement);  // Make restored elements draggable
    }
  });
}

// Delete Selected Element
function deleteSelectedElement() {
  if (selectedElement) {
    selectedElement.remove();
    selectedElement = null;
    document.querySelector('.edit-options').innerHTML = '<p>Select an element to edit</p>';
    saveCanvasState();  // Save after deletion
  } else {
    alert('No element selected to delete!');
  }
}

// Make Element Draggable
function makeElementDraggable(element) {
  element.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text', element.dataset.id);
  });

  element.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  element.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggedElementId = e.dataTransfer.getData('text');
    const draggedElement = document.querySelector(`[data-id="${draggedElementId}"]`);
    const rect = element.getBoundingClientRect();
    draggedElement.style.position = 'absolute';
    draggedElement.style.left = `${e.clientX - rect.left}px`;
    draggedElement.style.top = `${e.clientY - rect.top}px`;
    saveCanvasState();  // Save state after moving
  });
}

// Initialize the Editor
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('delete-btn').addEventListener('click', deleteSelectedElement);
  loadElementsJSON();
  
  window.addEventListener('beforeunload', saveCanvasState);
});