// const apiUrl = "https://api.monobank.ua/bank/currency"
// const apiUr2 = "https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5"
const BASE_URL = "https://www.floatrates.com";

//enter the currency code of the main country
const BASIC_COUNTRY = `UAH`;

//enter the bank commission
const BANK_COMMISSION = 1.01;

// enter the currency codes of the countries for currency exchange
// the first two currencies are displayed
const userCountries = ["USD", "EUR", "PLN", "CAD"];

const refs = {
  converter: document.querySelector(".converter"),
  mainCours: document.querySelector(".converter__main_cours"),
  selectFrom: document.querySelector("#selectFrom"),
  courses: document.querySelector(".converter__courses"),
  selectFrom: document.querySelector("#selectFrom"),
  selectTo: document.querySelector("#selectTo"),
  inputFrom: document.querySelector(".converter__courses_from__input"),
  inputTo: document.querySelector(".converter__courses_to__input"),
  flagBg: document.querySelector(".flag-bg"),
};

addBasicCountryToUsedCounties(BASIC_COUNTRY);

makeApp();

function addBasicCountryToUsedCounties(basicCountry) {
  userCountries.unshift(basicCountry);
}

async function getCourses() {
  try {
    const dayliCourses = await fetchCourses();
    // console.log(dayliCourses)
    return dayliCourses;
  } catch (e) {
    console.error(e);
  }
}

async function makeApp() {
  const dayliCourses = await getCourses();
  addMainCourseToPage(dayliCourses);
  createCurrenciesElementsToPage(dayliCourses);
  addSelectElementsToPage(dayliCourses);
  addListeners(dayliCourses);
}

async function fetchCourses() {
  const url = BASE_URL;
  const obj = {};

  const arrayOfPromises = userCountries.map(async (userCountry) => {
    const response = await fetch(
      `${url}/daily/${userCountry.toLowerCase()}.json`
    );
    const data = await response.json();
    obj[userCountry] = {
      flagUrl: `./../images/${userCountry.toLowerCase().slice(0, 2) + ".svg"}`,
      //   `https://countryflagsapi.com/svg/${userCountry.toLowerCase().slice(0, 2)}`,
      ...data,
    };
  });
  const courses = await Promise.all(arrayOfPromises);
  return obj;
}

function addMainCourseToPage(obj) {
  refs.mainCours.textContent = BASIC_COUNTRY;
  refs.converter.style.backgroundImage = `url('${obj[BASIC_COUNTRY].flagUrl}')`;
}

function createCurrenciesElementsToPage(obj) {
  const setDisplayedCurrenciesCuntries = () => userCountries.slice(1, 3);
  const arrayOfDisplayedCurrencies = setDisplayedCurrenciesCuntries();

  for (let key of arrayOfDisplayedCurrencies) {
    const markup = `
            <li class="flex"> 
                <h2 class="flag-bg" style="background-image: url('${
                  obj[key].flagUrl
                }')">${key}</h2>
                <div class="converter__courses_value">
                    <p>Sell ${obj[key][
                      BASIC_COUNTRY.toLowerCase()
                    ].rate.toFixed(2)}</p>
                    <p>Buy ${(
                      obj[key][BASIC_COUNTRY.toLowerCase()].rate *
                      BANK_COMMISSION
                    ).toFixed(2)}</p>
                </div>
            </li> `;
    refs.courses.insertAdjacentHTML("beforeend", markup);
  }
}

function addSelectElementsToPage(obj) {
  for (const element in obj) {
    const markupSelect = `
            <option value="${element}" >
                ${element}
            </option>`;
    refs.selectFrom.insertAdjacentHTML("beforeend", markupSelect);
    refs.selectTo.insertAdjacentHTML("beforeend", markupSelect);
  }

  refs.selectFrom.value = userCountries[0];
  refs.selectTo.value = userCountries[1];
}

function addListeners(obj) {
  let coefficient = 1;
  refs.inputFrom.value = 0;
  refs.inputTo.value = 0;

  const setCoefficient = () => {
    if (refs.selectTo.value === refs.selectFrom.value) {
      return (coefficient = 1);
    }

    if (refs.selectFrom.value !== refs.selectTo.value) {
      coefficient =
        obj[refs.selectFrom.value][refs.selectTo.value.toLowerCase()].rate;

      if (
        obj[refs.selectFrom.value][refs.selectTo.value.toLowerCase()].rate <
        obj[refs.selectTo.value][refs.selectFrom.value.toLowerCase()].rate
      ) {
        return (coefficient /= BANK_COMMISSION);
      }
    }
  };

  const setCoefficient2 = () => {
    if (refs.selectTo.value === refs.selectFrom.value) {
      return (coefficient = 1);
    }

    if (refs.selectFrom.value !== refs.selectTo.value) {
      coefficient =
        obj[refs.selectTo.value][refs.selectFrom.value.toLowerCase()].rate;

      if (
        obj[refs.selectFrom.value][refs.selectTo.value.toLowerCase()].rate <
        obj[refs.selectTo.value][refs.selectFrom.value.toLowerCase()].rate
      ) {
        return (coefficient *= BANK_COMMISSION);
      }
    }
  };

  const calculateFromInput = () =>
    (refs.inputTo.value = (refs.inputFrom.value * coefficient).toFixed(2));
  const calculateFromInput2 = () =>
    (refs.inputFrom.value = (refs.inputTo.value * coefficient).toFixed(2));

  refs.inputFrom.addEventListener("input", () => {
    setCoefficient();
    calculateFromInput();
  });

  refs.inputTo.addEventListener("input", () => {
    setCoefficient2();
    calculateFromInput2(refs.selectTo.value);
  });

  refs.selectFrom.addEventListener("change", () => {
    setCoefficient();
    calculateFromInput();
  });

  refs.selectTo.addEventListener("change", () => {
    setCoefficient2();
    calculateFromInput2();
  });
}
