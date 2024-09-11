import { init } from './Init.js';

const getSizes = (screenWidth, screenHeight) => {
  const smallerDimension = Math.min(screenWidth, screenHeight);
  const small = Math.floor(smallerDimension * 0.5);
  const medium = Math.floor(smallerDimension * 0.75);
  const large = Math.floor(smallerDimension * 0.99);
  return { small: small, medium: medium, large: large };
};

const checkScreenSize = () => {
  if (window.innerWidth < 700) {
    document.getElementById('content').style.display = 'none';
    document.getElementById('mobileWarning').style.display = 'flex';
    return false;
  }
  else {
    document.getElementById('content').style.display = 'block';
    document.getElementById('mobileWarning').style.display = 'none';
    return true;
  }
};

const checkWebGL2 = () => {
  if (!document.createElement('canvas').getContext('webgl2')) {
    document.getElementById('content').style.display = 'none';
    document.getElementById('webglWarning').style.display = 'flex';
    return false;
  }
  return true;
};

const startGame = () => {
  const res = document.getElementById('dropdown').value.split('x')[0];
  document.getElementById('content').remove();
  canvas = document.createElement('canvas');
  canvas.id = 'container';
  canvas.width = res;
  canvas.height = res;
  canvas.style.backgroundColor = 'black';
  canvas.style.position = 'absolute';
  canvas.style.top = '50%';
  canvas.style.left = '50%';
  canvas.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(canvas);
  SCREEN_WIDTH = parseInt(canvas.width);
  SCREEN_HEIGHT = parseInt(canvas.height);
  init();
};

window.onload = () => {
  if (checkScreenSize() && checkWebGL2()) {
      const sizes = getSizes(window.innerWidth, window.innerHeight);
      const select = document.getElementById('dropdown');
      select.innerHTML = '';
      for (const [label, size] of Object.entries(sizes)) {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = `${label.charAt(0).toUpperCase() + label.slice(1)}: ${size}x${size}`;
        select.appendChild(option);
      }
  }
};

window.startGame = startGame;
