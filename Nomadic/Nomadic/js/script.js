function updateElementPositions() {
  const rickBg = document.getElementById("rick-bg");
  const video = document.getElementById("video");
  const power = document.getElementById("power");
  const channelUp = document.getElementById("channel-up");
  const emojis = document.getElementById("emojis");

  const videoWidth = rickBg.offsetWidth;
  const videoHeight = rickBg.offsetHeight;

  // Set the size and position for the #video element
  video.style.width = videoWidth * 0.368 + "px";
  video.style.left = videoWidth * 0.5 + "px";
  video.style.top = videoHeight * 0.45 + "px";

  // Set the size and position for the #power element
  power.style.width = videoWidth * 0.06 + "px";
  power.style.height = videoWidth * 0.06 + "px";
  power.style.left = videoWidth * 0.63 + "px";
  power.style.top = videoHeight * 0.9 + "px";

  // Set the size and position for the #channel-up element
  channelUp.style.width = videoWidth * 0.1 + "px";
  channelUp.style.height = videoWidth * 0.1 + "px";
  channelUp.style.left = videoWidth * 0.87 + "px";
  channelUp.style.top = videoHeight * 0.7 + "px";

  // Set the position for the .emojis element
  emojis.style.left = videoWidth * 0.45 + "px";
  emojis.style.top = videoHeight * 0.75 + "px";

  // Set the size of the images inside the .emojis element
  const emojiImages = emojis.querySelectorAll("img");
  emojiImages.forEach((img) => {
    img.style.width = videoWidth * 0.03 + "px";
    img.style.height = videoWidth * 0.03 + "px";
  });
}

window.addEventListener("load", updateElementPositions);
window.addEventListener("resize", updateElementPositions);
