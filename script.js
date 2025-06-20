const params = new URLSearchParams(window.location.search);
const category = params.get("category");

document.querySelectorAll('.item').forEach(item => {
  if (item.classList.contains(category)) {
    item.classList.remove('hidden');
  } else {
    item.classList.add('hidden');
  }
});
