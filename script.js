// حفظ التفضيلات
const planBtn = document.getElementById('planBtn');
if (planBtn) {
  planBtn.addEventListener('click', () => {
    const selected = { mood: null, interest: [], food: null, budget: null };

    document.querySelectorAll('.pref-card.selected').forEach(card => {
      const type = card.dataset.type;
      const value = card.dataset.value;
      if (type === 'interest') {
        selected.interest.push(value);
      } else {
        selected[type] = value;
      }
    });

    if (!selected.mood || selected.interest.length === 0 || !selected.food || !selected.budget) {
      alert("Please select all required preferences!");
      return;
    }

    sessionStorage.setItem('preferences', JSON.stringify(selected));
    window.location.href = 'results.html';
  });
}

// اختيار الكروت
document.querySelectorAll('.pref-card').forEach(card => {
  card.addEventListener('click', () => {
    const type = card.dataset.type;
    
    if (type === 'interest') {
      card.classList.toggle('selected');
      const selectedInterests = document.querySelectorAll(`.pref-card.selected[data-type="interest"]`);
      if (selectedInterests.length > 2) {
        card.classList.remove('selected');
        alert("You can select up to 2 interests only!");
      }
    } else {
      document.querySelectorAll(`.pref-card[data-type="${type}"]`).forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    }
  });
});

// عرض النتائج
const resultsContainer = document.getElementById('resultsContainer');
if (resultsContainer) {
  const preferences = JSON.parse(sessionStorage.getItem('preferences') || "{}");

  fetch('places.json')
    .then(res => res.json())
    .then(places => {
      const matched = places.filter(place => {
        return place.mood.includes(preferences.mood) &&
               place.interest.some(i => preferences.interest.includes(i)) &&
               (place.food.includes(preferences.food) || place.food.includes("none")) &&
               place.budget === preferences.budget;
      });

      while (matched.length < 3 && places.length > matched.length) {
        const rand = places[Math.floor(Math.random() * places.length)];
        if (!matched.includes(rand)) matched.push(rand);
      }

      const times = ["Morning", "Afternoon", "Evening"];
      matched.slice(0, 3).forEach((place, idx) => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${place.image}" class="card-img-top" alt="${place.name}">
            <div class="card-body">
              <h5 class="card-title">${times[idx]}: ${place.name}</h5>
              <p class="card-text">${place.description}</p>
              <button class="btn btn-custom btn-sm" 
                data-bs-toggle="modal" 
                data-bs-target="#placeModal"
                data-name="${place.name}"
                data-desc="${place.description}"
                data-img="${place.image}"
                data-category="${place.category || ''}"
                data-price="${place.priceRange || ''}"
                data-hours="${place.workingHours || ''}"
                data-features="${place.features ? place.features.join(', ') : ''}"
                data-location="${place.location}">
                More Info
              </button>
            </div>
          </div>
        `;
        resultsContainer.appendChild(card);
      });

      const modal = document.getElementById('placeModal');
      modal.addEventListener('show.bs.modal', event => {
        const btn = event.relatedTarget;
        document.getElementById('placeTitle').innerText = btn.dataset.name;
        document.getElementById('placeDescription').innerText = btn.dataset.desc;
        document.getElementById('placeImage').src = btn.dataset.img;
        document.getElementById('placeCategory').innerText = btn.dataset.category || "N/A";
        document.getElementById('placePrice').innerText = btn.dataset.price || "N/A";
        document.getElementById('placeHours').innerText = btn.dataset.hours || "N/A";
        document.getElementById('placeFeatures').innerText = btn.dataset.features || "N/A";
        document.getElementById('placeLocation').href = btn.dataset.location;
      });
    });
}
