'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const render_error = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg); // insert text as a sibling of the element
};

const render_country = function (data, className = '') {
  // Check if 'flags' property exists in the 'data' object
  if (data.flags) {
    const html = `
        <article class="country ${className}">
            <img class="country__img" src="${data.flags.svg}" />
            <div class="country__data">
                <h3 class="country__name">${data.name.common}</h3>
                <h4 class="country__region">${data.region}</h4>
                <p class="country__row"><span>👫</span>${(
                  data.population / 1000000
                ).toFixed(1)} million people</p>
                <p class="country__row"><span>🗣️</span>${
                  Object.values(data.languages)[0]
                }</p>
                </p>
                <p class="country__row"><span>💰</span>${
                  Object.values(data.currencies)[0].name
                }</p>

                </p>
            </div>
        </article>
      `;

    countriesContainer.insertAdjacentHTML('beforeend', html);
  }
};

const getJson = async (url, errorMsg = 'Failed to fetch JSON') => {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Resource not found at ${url}`);
    } else {
      throw new Error(`${errorMsg} (${response.status})`);
    }
  }

  return await response.json();
};

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    // navigator -> it is an object that lives in the browser
    // (geolocation API) -> it is a browser API that allows us to get the current position of the user
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
    });
  });
};

const whereAmI = function () {
  // Geolocation API
  try {
    getPosition()
      .then(pos => {
        const { latitude: lat, longitude: lng } = pos.coords;

        return getJson(
          `https://geocode.xyz/${lat},${lng}?geoit=json`,
          'Problem getting location'
        );
      })
      .then(data => {
        console.log(`You are in ${data.city}, ${data.country}`);
        return getJson(
          `https://restcountries.com/v3.1/name/${data.country}`,
          'Country not found'
        );
      })
      .then(data => {
        // Country 1
        render_country(data[0]);

        // neighbor country (2)
        const [neighbor] = data[0].borders;
        if (!neighbor) throw new Error('No neighbor found!');

        // Palestine, not Israel, is the neighboring country of Egypt.
        if (neighbor === 'ISR') {
          return getJson(
            `https://restcountries.com/v3.1/name/Palestine`,
            'Country not found'
          );
        }
        return getJson(
          `https://restcountries.com/v3.1/alpha/${neighbor}`,
          'Country not found'
        );
      })
      .then(data => {
        render_country(data[0], 'neighbour');
      })
      .catch(err => {
        console.error(`${err.message} 💥`);
        render_error(`Something went wrong 💥💥💥 ${err.message}. Try again!`);
      })
      .finally(() => {
        countriesContainer.style.opacity = 1;
      });
  } catch (err) {
    console.error(`${err.message} 💥`);
    render_error(`Something went wrong 💥💥💥 ${err.message}. Try again!`);
  }
};

let is_clicked = false;

btn.addEventListener('click', function () {
  if (!is_clicked) {
    whereAmI();
    is_clicked = true;
  }
});
