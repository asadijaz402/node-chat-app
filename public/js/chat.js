// const { Socket } = require("socket.io");
const socket = io();
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $locationButton = document.querySelector("#send-location");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const roomTemplate = document.querySelector("#room-template").innerHTML;

const $messages = document.querySelector("#messages");
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    if (error) {
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      return console.log(error);
    }
    $messageFormInput.value = "";
    $messageFormInput.focus();
    $messageFormButton.removeAttribute("disabled");
  });
});
document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }
  $locationButton.setAttribute("disabled", "disables");

  navigator.geolocation.getCurrentPosition((postion) => {
    socket.emit(
      "sendLocation",
      {
        location: {
          lat: postion.coords.latitude,
          long: postion.coords.longitude,
        },
      },
      (message) => {
        $locationButton.removeAttribute("disabled");
      }
    );
  });
});
socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
    username: message.username,
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationSend", (url) => {
  const html = Mustache.render(locationTemplate, {
    url: url.text,
    createdAt: moment(url.createdAt).format("h:mm a"),
    username: url.username,
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(roomTemplate, {
    room,
    users,
  });

  document.querySelector("#sidebar").innerHTML = html;
  // $messages.insertAdjacentHTML("beforeend", html);
});
